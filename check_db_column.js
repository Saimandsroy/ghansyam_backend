
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkColumns() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'new_sites';
    `);
        console.log("Columns in new_sites:");
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        // Check for vendor_id specifically
        const hasVendorId = res.rows.some(r => r.column_name === 'vendor_id');
        console.log(`\nHas vendor_id: ${hasVendorId}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();
