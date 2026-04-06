require('dotenv').config();
const { query } = require('./config/database');

async function check() {
    try {
        const u = await query("SELECT id, name, email FROM users WHERE email LIKE '%aswad%'");
        console.log("Users:", u.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
