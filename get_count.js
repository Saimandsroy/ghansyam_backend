require('dotenv').config();
const { query } = require('./config/database');
async function check() {
    const res = await query("SELECT count(*) FROM users");
    console.log("Total users:", res.rows[0].count);
    
    // Search aswad
    const u = await query("SELECT * FROM users WHERE email LIKE '%aswad%' OR email LIKE '%Aswad%' OR name LIKE '%Aswad%' OR name LIKE '%aswad%'");
    console.log("Aswad Search:", u.rows);
    process.exit(0);
}
check();
