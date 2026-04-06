require('dotenv').config();
const { query } = require('./config/database');
async function check() {
    const res = await query("SELECT id, name, email FROM users WHERE role = 'blogger'");
    for (const r of res.rows) {
        if (r.email.toLowerCase().includes('aswad')) {
            console.log("Found:", r);
        }
    }
    console.log("Total bloggers:", res.rows.length);
    process.exit(0);
}
check();
