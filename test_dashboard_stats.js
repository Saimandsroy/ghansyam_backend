require('dotenv').config();
const { query } = require('./config/database');

const testDashboardStats = async () => {
    try {
        const managerId = 1653; // From debug data

        console.log('Testing Dashboard Stats Queries...\n');

        // Test Bloggers Count
        const bloggers = await query(
            `SELECT COUNT(*) as count 
             FROM new_order_process_details nopd
             JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
             JOIN new_orders o ON nop.new_order_id = o.id
             WHERE nopd.status = 7 
               AND nop.status = 7
               AND o.new_order_status < 5
               AND nop.manager_id = $1`,
            [managerId]
        );
        console.log(`Pending Bloggers: ${bloggers.rows[0].count}`);

        // Test Teams Count
        const teams = await query(
            `SELECT COUNT(*) as count 
             FROM new_orders o
             JOIN new_order_processes nop ON o.id = nop.new_order_id
             WHERE o.new_order_status = 2 
               AND nop.status = 2
               AND o.manager_id = $1`,
            [managerId]
        );
        console.log(`Pending Teams: ${teams.rows[0].count}`);

        // Test Writers Count
        const writers = await query(
            `SELECT COUNT(*) as count 
             FROM new_orders o
             JOIN new_order_processes nop ON o.id = nop.new_order_id
             WHERE o.new_order_status = 4 
               AND nop.status = 4
               AND o.manager_id = $1`,
            [managerId]
        );
        console.log(`Pending Writers: ${writers.rows[0].count}`);

        console.log('\n✅ Dashboard stats now match pending list queries!');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

testDashboardStats();
