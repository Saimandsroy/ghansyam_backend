require('dotenv').config();
const { pool } = require('./config/database');

const fixTasks = async () => {
    try {
        console.log('Fixing tasks...');

        // 1. Fix Team Task 3144 (Status 2, but missing details)
        console.log('--- Fixing Team Task 3144 ---');
        // Find a site to attach
        const sites = await pool.query('SELECT id FROM new_sites LIMIT 1');
        if (sites.rows.length > 0) {
            const siteId = sites.rows[0].id;
            // Get process ID
            const teamTask = await pool.query(`
                SELECT nop.id as process_id
                FROM new_orders o
                LEFT JOIN new_order_processes nop ON o.id = nop.new_order_id
                WHERE o.id = 3144
            `);

            if (teamTask.rows.length > 0 && teamTask.rows[0].process_id) {
                const processId = teamTask.rows[0].process_id;
                // Check if details exist
                const details = await pool.query('SELECT id FROM new_order_process_details WHERE new_order_process_id = $1', [processId]);
                if (details.rows.length === 0) {
                    console.log(`Inserting missing detail for process ${processId} with site ${siteId}`);
                    await pool.query(`
                        INSERT INTO new_order_process_details 
                        (new_order_process_id, new_site_id, note, price, created_at, updated_at, status)
                        VALUES ($1, $2, 'Fixed by system', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2)
                    `, [processId, siteId]);
                } else {
                    console.log('Details already exist for 3144');
                }
            }
        } else {
            console.log('No sites found to attach to 3144');
        }

        // 2. Fix Writer Task 3132 (Status 3 -> 4)
        console.log('--- Fixing Writer Task 3132 ---');
        await pool.query(`UPDATE new_orders SET new_order_status = 4, updated_at = CURRENT_TIMESTAMP WHERE id = 3132`);
        await pool.query(`
            UPDATE new_order_processes 
            SET status = 4, updated_at = CURRENT_TIMESTAMP 
            WHERE new_order_id = 3132
        `);
        console.log('Updated 3132 to status 4 (Submitted)');

        // 3. Fix Blogger Task 51445 (Status 11 -> 7)
        console.log('--- Fixing Blogger Task 51445 ---');
        await pool.query(`
            UPDATE new_order_process_details 
            SET status = 7, updated_at = CURRENT_TIMESTAMP, submit_url = 'https://fixed-url.com'
            WHERE id = 51445
        `);
        console.log('Updated 51445 to status 7 (Submitted/Pending)');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

fixTasks();
