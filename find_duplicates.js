require('dotenv').config();
const { query } = require('./config/database');

const findDuplicates = async () => {
    try {
        const managerId = 1653;

        console.log('Finding orders with multiple process records...\n');

        const result = await query(
            `SELECT o.id, o.client_name, COUNT(*) as process_count
             FROM new_orders o
             JOIN new_order_processes nop ON o.id = nop.new_order_id
             WHERE o.new_order_status = 4 
               AND nop.status = 4
               AND o.manager_id = $1
             GROUP BY o.id, o.client_name
             HAVING COUNT(*) > 1
             ORDER BY process_count DESC`,
            [managerId]
        );

        console.log(`Found ${result.rows.length} orders with multiple process records:`);
        result.rows.forEach(row => {
            console.log(`  Order ${row.id} (${row.client_name}): ${row.process_count} process records`);
        });

        // Show correct query using LATERAL JOIN
        console.log('\n\nCorrect Query using LATERAL JOIN (like Task.findAll):');
        const correctResult = await query(
            `SELECT COUNT(*) as count
             FROM new_orders o
             LEFT JOIN LATERAL (
                 SELECT status, writer_id, id 
                 FROM new_order_processes 
                 WHERE new_order_id = o.id 
                 ORDER BY id DESC LIMIT 1
             ) nop ON true
             WHERE o.new_order_status = 4
               AND nop.status = 4
               AND o.manager_id = $1`,
            [managerId]
        );

        console.log(`LATERAL JOIN count: ${correctResult.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

findDuplicates();
