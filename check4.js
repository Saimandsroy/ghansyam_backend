require('dotenv').config();
const { query } = require('./config/database');
async function check() {
    const credits = await query("SELECT SUM(CAST(price AS NUMERIC)) as tot FROM wallet_histories WHERE wallet_id = 308 AND type='credit'");
    const debits = await query("SELECT SUM(CAST(price AS NUMERIC)) as tot FROM wallet_histories WHERE wallet_id = 308 AND type='debit'");
    console.log(`Credits: $${credits.rows[0].tot}, Debits: $${debits.rows[0].tot}, Balance: $${credits.rows[0].tot - debits.rows[0].tot}`);
    process.exit(0);
}
check();
