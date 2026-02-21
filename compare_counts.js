require('dotenv').config();
const { query } = require('./config/database');

const compareCounts = async () => {
    try {
        const managerId = 1653;

        console.log('Comparing Dashboard vs List Counts...\n');

        // Dashboard Writer Count Query (what getDashboardStats uses)
        const dashboardCount = await query(
            `SELECT COUNT(*) as count 
             FROM new_orders o
             JOIN new_order_processes nop ON o.id = nop.new_order_id
             WHERE o.new_order_status = 4 
               AND nop.status = 4
               AND o.manager_id = $1`,
            [managerId]
        );

        // List Count Query (what Task.findAll returns)
        const Task = require('./models/Task');
        const orders = await Task.findAll({
            manager_id: managerId,
            current_status: 'PENDING_MANAGER_APPROVAL_2'
        });

        console.log(`Dashboard Query Count: ${dashboardCount.rows[0].count}`);
        console.log(`List Query Count: ${orders.length}`);

        if (dashboardCount.rows[0].count == orders.length) {
            console.log('\n✅ Counts match! Dashboard is correct.');
        } else {
            console.log('\n❌ MISMATCH! Dashboard and list show different counts.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

compareCounts();
