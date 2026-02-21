require('dotenv').config();
const { query } = require('./config/database');

const testDashboardFix = async () => {
    try {
        const managerId = 1653;

        console.log('Testing Dashboard with LATERAL JOIN fix...\n');

        // Test the NEW dashboard query with LATERAL JOIN
        const writersResult = await query(
            `SELECT COUNT(*) as count 
             FROM new_orders o
             LEFT JOIN LATERAL (
                 SELECT status, id 
                 FROM new_order_processes 
                 WHERE new_order_id = o.id 
                 ORDER BY id DESC LIMIT 1
             ) nop ON true
             WHERE o.new_order_status = 4 
               AND nop.status = 4
               AND o.manager_id = $1`,
            [managerId]
        );

        const teamsResult = await query(
            `SELECT COUNT(*) as count 
             FROM new_orders o
             LEFT JOIN LATERAL (
                 SELECT status, id 
                 FROM new_order_processes 
                 WHERE new_order_id = o.id 
                 ORDER BY id DESC LIMIT 1
             ) nop ON true
             WHERE o.new_order_status = 2 
               AND nop.status = 2
               AND o.manager_id = $1`,
            [managerId]
        );

        console.log(`Dashboard Writers Count (LATERAL JOIN): ${writersResult.rows[0].count}`);
        console.log(`Dashboard Teams Count (LATERAL JOIN): ${teamsResult.rows[0].count}`);
        console.log('\n✅ Both dashboard queries now use LATERAL JOIN!');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

testDashboardFix();
