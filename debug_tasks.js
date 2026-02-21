require('dotenv').config();
const { pool } = require('./config/database');

const checkTasks = async () => {
    try {
        console.log('Checking tasks...');

        // Check Team Task 3144
        console.log('--- Team Task 3144 ---');
        const teamTask = await pool.query(`
            SELECT o.id, o.new_order_status, nop.id as process_id, nop.status as process_status, nop.team_id, nop.manager_id
            FROM new_orders o
            LEFT JOIN new_order_processes nop ON o.id = nop.new_order_id
            WHERE o.id = 3144
        `);
        console.log('Order/Process:', teamTask.rows);

        if (teamTask.rows.length > 0 && teamTask.rows[0].process_id) {
            const teamDetails = await pool.query(`
                SELECT * FROM new_order_process_details WHERE new_order_process_id = $1
            `, [teamTask.rows[0].process_id]);
            console.log('Details:', teamDetails.rows);
        }

        // Check Writer Task 3132
        console.log('--- Writer Task 3132 ---');
        const writerTask = await pool.query(`
            SELECT o.id, o.new_order_status, nop.id as process_id, nop.status as process_status, nop.writer_id, nop.manager_id
            FROM new_orders o
            LEFT JOIN new_order_processes nop ON o.id = nop.new_order_id
            WHERE o.id = 3132
        `);
        console.log('Order/Process:', writerTask.rows);

        if (writerTask.rows.length > 0 && writerTask.rows[0].process_id) {
            const writerDetails = await pool.query(`
                SELECT * FROM new_order_process_details WHERE new_order_process_id = $1
            `, [writerTask.rows[0].process_id]);
            console.log('Details:', writerDetails.rows);
        }

        // Check Blogger Task 51445 (detail ID)
        console.log('--- Blogger Task 51445 (Detail ID) ---');
        const bloggerTask = await pool.query(`
            SELECT nopd.id, nopd.status, nopd.vendor_id, nopd.submit_url, nop.manager_id, o.new_order_status
            FROM new_order_process_details nopd
            JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
            JOIN new_orders o ON nop.new_order_id = o.id
            WHERE nopd.id = 51445
        `);
        console.log('Detail/Process/Order:', bloggerTask.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

checkTasks();
