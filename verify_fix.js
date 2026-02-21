require('dotenv').config();
const { pool } = require('./config/database');
const Task = require('./models/Task');

const verifyFix = async () => {
    try {
        console.log('Testing pending list endpoints...\n');

        const MANAGER_ID = 1653; // Manager ID from the debug data

        // Test Pending Teams
        console.log('=== PENDING TEAMS ===');
        const teams = await Task.findAll({
            manager_id: MANAGER_ID,
            current_status: 'PENDING_MANAGER_APPROVAL_1'
        });
        console.log(`Found ${teams.length} pending team approvals`);
        teams.slice(0, 5).forEach(t => {
            console.log(`  Order ${t.id}: ${t.client_name || 'N/A'}, Team: ${t.team_name}`);
        });

        // Test Pending Writers
        console.log('\n=== PENDING WRITERS ===');
        const writers = await Task.findAll({
            manager_id: MANAGER_ID,
            current_status: 'PENDING_MANAGER_APPROVAL_2'
        });
        console.log(`Found ${writers.length} pending writer approvals`);
        writers.slice(0, 5).forEach(t => {
            console.log(`  Order ${t.id}: ${t.client_name || 'N/A'}, Writer: ${t.writer_name}`);
        });

        // Test Pending Bloggers (uses different query)
        console.log('\n=== PENDING BLOGGERS ===');
        const bloggers = await pool.query(`
            SELECT COUNT(*) as count
            FROM new_order_process_details nopd
            JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
            WHERE nopd.status = 7 AND nop.manager_id = $1
        `, [MANAGER_ID]);
        console.log(`Found ${bloggers.rows[0].count} pending blogger approvals`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

verifyFix();
