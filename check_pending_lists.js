require('dotenv').config();
const { pool } = require('./config/database');

const checkPendingLists = async () => {
    try {
        console.log('Checking what appears in each pending list...\n');

        // Check Pending Teams (Status 2)
        console.log('=== PENDING TEAMS (Status 2) ===');
        const teams = await pool.query(`
            SELECT o.id, o.new_order_status, o.client_name, 
                   nop.team_id, nop.manager_id,
                   COUNT(nopd.id) as detail_count
            FROM new_orders o
            JOIN new_order_processes nop ON o.id = nop.new_order_id
            LEFT JOIN new_order_process_details nopd ON nop.id = nopd.new_order_process_id
            WHERE o.new_order_status = 2
            GROUP BY o.id, o.new_order_status, o.client_name, nop.team_id, nop.manager_id
            ORDER BY o.id DESC
            LIMIT 10
        `);
        console.log(`Found ${teams.rows.length} orders with status 2:`);
        teams.rows.forEach(row => {
            console.log(`  Order ${row.id}: ${row.client_name || 'N/A'}, Team ${row.team_id}, Manager ${row.manager_id}, Details: ${row.detail_count}`);
        });

        // Check Pending Writers (Status 4)
        console.log('\n=== PENDING WRITERS (Status 4) ===');
        const writers = await pool.query(`
            SELECT o.id, o.new_order_status, o.client_name,
                   nop.writer_id, nop.manager_id,
                   COUNT(nopd.id) as detail_count
            FROM new_orders o
            JOIN new_order_processes nop ON o.id = nop.new_order_id
            LEFT JOIN new_order_process_details nopd ON nop.id = nopd.new_order_process_id
            WHERE o.new_order_status = 4
            GROUP BY o.id, o.new_order_status, o.client_name, nop.writer_id, nop.manager_id
            ORDER BY o.id DESC
            LIMIT 10
        `);
        console.log(`Found ${writers.rows.length} orders with status 4:`);
        writers.rows.forEach(row => {
            console.log(`  Order ${row.id}: ${row.client_name || 'N/A'}, Writer ${row.writer_id}, Manager ${row.manager_id}, Details: ${row.detail_count}`);
        });

        // Check Pending Bloggers (Detail Status 7)
        console.log('\n=== PENDING BLOGGERS (Detail Status 7) ===');
        const bloggers = await pool.query(`
            SELECT nopd.id as detail_id, nopd.status, nopd.vendor_id, nopd.submit_url,
                   nop.new_order_id, nop.manager_id,
                   o.new_order_status, o.client_name
            FROM new_order_process_details nopd
            JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
            JOIN new_orders o ON nop.new_order_id = o.id
            WHERE nopd.status = 7
            ORDER BY nopd.id DESC
            LIMIT 10
        `);
        console.log(`Found ${bloggers.rows.length} details with status 7:`);
        bloggers.rows.forEach(row => {
            console.log(`  Detail ${row.detail_id}: Order ${row.new_order_id} (status ${row.new_order_status}), Blogger ${row.vendor_id}, Manager ${row.manager_id}, URL: ${row.submit_url ? 'Yes' : 'No'}`);
        });

        // Check if there are "completed" tasks in these lists
        console.log('\n=== CHECKING FOR COMPLETED TASKS ===');
        const completedInPending = await pool.query(`
            SELECT 'Team' as type, o.id, o.new_order_status, nop.status as process_status
            FROM new_orders o
            JOIN new_order_processes nop ON o.id = nop.new_order_id
            WHERE o.new_order_status = 2 AND nop.status != 2
            
            UNION ALL
            
            SELECT 'Writer' as type, o.id, o.new_order_status, nop.status as process_status
            FROM new_orders o
            JOIN new_order_processes nop ON o.id = nop.new_order_id
            WHERE o.new_order_status = 4 AND nop.status != 4
            
            UNION ALL
            
            SELECT 'Blogger' as type, nop.new_order_id as id, o.new_order_status, nopd.status as process_status
            FROM new_order_process_details nopd
            JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
            JOIN new_orders o ON nop.new_order_id = o.id
            WHERE nopd.status = 7 AND o.new_order_status > 5
        `);

        if (completedInPending.rows.length > 0) {
            console.log('WARNING: Found mismatched statuses:');
            completedInPending.rows.forEach(row => {
                console.log(`  ${row.type} Order ${row.id}: order_status=${row.new_order_status}, process_status=${row.process_status}`);
            });
        } else {
            console.log('No status mismatches found.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

checkPendingLists();
