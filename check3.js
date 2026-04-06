require('dotenv').config();
const { query } = require('./config/database');
async function check() {
    const res = await query("SELECT u.id, u.name, u.email FROM users u JOIN wallets w ON w.user_id = u.id WHERE w.id = 444");
    console.log(res.rows[0]);
    process.exit(0);
}
check();
