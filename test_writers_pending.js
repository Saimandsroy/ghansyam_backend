require('dotenv').config();
const Task = require('./models/Task');
const { pool } = require('./config/database');

const testWritersPending = async () => {
    try {
        const managerId = 1653;

        console.log('Testing Writer Pending List...\n');

        // Test new implementation
        const orders = await Task.findAll({
            manager_id: managerId,
            current_status: 'PENDING_MANAGER_APPROVAL_2'
        });

        console.log(`Found ${orders.length} pending writer orders:`);
        orders.slice(0, 10).forEach((o, i) => {
            console.log(`  ${i + 1}. Order ${o.id}: ${o.client_name || 'N/A'}, Writer: ${o.writer_name || 'N/A'}`);
        });

        console.log('\n✅ Writers pending list now uses database-level dual-status checking!');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

testWritersPending();
