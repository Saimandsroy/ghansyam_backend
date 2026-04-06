require('dotenv').config();
const { query } = require('./config/database');

async function investigate() {
    const email = 'aswadmaswad8@gmail.com';
    
    // 1. Get user & wallet
    const userRes = await query(`SELECT id, name FROM users WHERE email = $1`, [email]);
    if (!userRes.rows[0]) { console.log("User not found"); process.exit(1); }
    const userId = userRes.rows[0].id;
    console.log(`User: ${userRes.rows[0].name} (ID: ${userId})`);
    
    const walletRes = await query(`SELECT id, balance FROM wallets WHERE user_id = $1`, [userId]);
    console.log(`Wallet balance: $${walletRes.rows[0]?.balance}`);
    
    // 2. Find ALL credit entries and cross-check with order detail status
    const credits = await query(`
        SELECT wh.id as wh_id, wh.price, wh.type, wh.created_at,
               nopd.id as detail_id, nopd.status as detail_status,
               no.order_id
        FROM wallet_histories wh
        JOIN wallets w ON wh.wallet_id = w.id
        LEFT JOIN new_order_process_details nopd ON wh.order_detail_id = nopd.id
        LEFT JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
        LEFT JOIN new_orders no ON nop.new_order_id = no.id
        WHERE w.user_id = $1 AND wh.type = 'credit'
        ORDER BY wh.created_at DESC
    `, [userId]);
    
    console.log("\n--- ALL Credit Entries ---");
    console.table(credits.rows);
    
    // 3. Find credits linked to rejected orders (status 11 or 12)
    const badCredits = credits.rows.filter(r => r.detail_status === 11 || r.detail_status === 12);
    console.log("\n--- ORPHANED Credits (order rejected but money still in wallet) ---");
    console.table(badCredits);
    
    const orphanedTotal = badCredits.reduce((sum, r) => sum + parseFloat(r.price || 0), 0);
    console.log(`\nTotal orphaned amount: $${orphanedTotal.toFixed(2)}`);
}

investigate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
