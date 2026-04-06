require('dotenv').config();
const { query } = require('./config/database');
async function check() {
    const res = await query("SELECT id, status, amount, type FROM transactions WHERE user_id = 23464");
    console.log("Transactions:", res.rows);
    process.exit(0);
}
check();
