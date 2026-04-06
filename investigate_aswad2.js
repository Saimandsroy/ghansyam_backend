require('dotenv').config();
const { query } = require('./config/database');

async function investigate() {
    const email = 'aswadmaswad8@gmail.com';
    const userRes = await query(`SELECT id, name FROM users WHERE email = $1`, [email]);
    const userId = userRes.rows[0].id;
    
    const walletRes = await query(`SELECT id, balance FROM wallets WHERE user_id = $1`, [userId]);
    console.log(`Wallet ID: ${walletRes.rows[0]?.id}, Balance: $${walletRes.rows[0]?.balance}`);
    
    // Check the specific order IDs user mentioned
    const orderIds = ['DK056695552', 'DKM85426566', 'DKM7566659', 'DK745595582', 'DK2546695852', 'Royal101'];
    
    const specificOrders = await query(`
        SELECT no.order_id, nopd.id as detail_id, nopd.status as detail_status, nopd.vendor_id,
               wh.id as wh_id, wh.type, wh.price as wh_price
        FROM new_orders no
        JOIN new_order_processes nop ON no.id = nop.new_order_id
        JOIN new_order_process_details nopd ON nop.id = nopd.new_order_process_id
        LEFT JOIN wallet_histories wh ON wh.order_detail_id = nopd.id
        WHERE no.order_id = ANY($1) AND nopd.vendor_id = $2
        ORDER BY no.order_id
    `, [orderIds, userId]);
    
    console.log("\n--- Specific Orders for this blogger ---");
    console.table(specificOrders.rows);
    
    // Check total credits vs total debits
    const totals = await query(`
        SELECT type, SUM(CAST(price AS NUMERIC)) as total
        FROM wallet_histories 
        WHERE wallet_id = $1
        GROUP BY type
    `, [walletRes.rows[0]?.id]);
    console.log("\n--- Credit/Debit Totals ---");
    console.table(totals.rows);
    
    // Check withdrawable orders query (what the wallet page shows)
    const withdrawable = await query(`
        SELECT wh.id, wh.order_detail_id, wh.price, wh.type, wh.withdraw_request_id,
               nopd.status as detail_status, no.order_id
        FROM wallet_histories wh
        JOIN wallets w ON wh.wallet_id = w.id
        LEFT JOIN new_order_process_details nopd ON wh.order_detail_id = nopd.id
        LEFT JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
        LEFT JOIN new_orders no ON nop.new_order_id = no.id
        WHERE w.user_id = $1 AND wh.type = 'credit'
        AND nopd.status != 8
        ORDER BY wh.created_at DESC
    `, [userId]);
    
    console.log("\n--- Credits where order is NOT status 8 (should be empty) ---");
    console.table(withdrawable.rows);
}

investigate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
