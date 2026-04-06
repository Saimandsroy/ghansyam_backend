require('dotenv').config();
const { query } = require('./config/database');

async function investigate() {
    const email = 'aswadmaswad8@gmail.com';
    const userRes = await query(`SELECT id, name FROM users WHERE email = $1`, [email]);
    const userId = userRes.rows[0].id;
    
    // Check ALL details for this blogger with status 11 or 12 (rejected)
    const rejected = await query(`
        SELECT no.order_id, nopd.id as detail_id, nopd.status, nopd.reject_reason, 
               nopd.created_at, nopd.updated_at,
               wh.id as wh_id, wh.price as credited_amount
        FROM new_order_process_details nopd
        JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
        JOIN new_orders no ON nop.new_order_id = no.id
        LEFT JOIN wallet_histories wh ON wh.order_detail_id = nopd.id
        WHERE nopd.vendor_id = $1 AND nopd.status IN (11, 12)
        ORDER BY nopd.updated_at DESC
    `, [userId]);
    
    console.log("--- ALL rejected orders for this blogger ---");
    console.table(rejected.rows);
    
    // Now check the getWalletHistory query — this is what the wallet page shows
    // This is the actual query from Transaction.js getWalletHistory
    const walletHistory = await query(`
        SELECT 
            wh.id,
            wh.order_detail_id,
            REGEXP_REPLACE(CAST(wh.price AS TEXT), '[^0-9.]', '', 'g') AS price,
            wh.type,
            wh.created_at,
            nopd.submit_url,
            nopd.status as detail_status,
            ns.root_domain AS website,
            no.order_id AS manual_order_id,
            COALESCE(wh_debit.withdraw_request_id, wh.withdraw_request_id) AS withdraw_request_id,
            wr.created_at AS request_date,
            CASE WHEN wr.status = 1 THEN wr.updated_at ELSE NULL END AS approved_date
        FROM wallet_histories wh
        JOIN wallets w ON wh.wallet_id = w.id
        LEFT JOIN new_order_process_details nopd ON wh.order_detail_id = nopd.id
        LEFT JOIN new_sites ns ON nopd.new_site_id = ns.id
        LEFT JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
        LEFT JOIN new_orders no ON nop.new_order_id = no.id
        LEFT JOIN wallet_histories wh_debit ON wh_debit.order_detail_id = wh.order_detail_id 
            AND wh_debit.type = 'debit' AND wh_debit.wallet_id = w.id
        LEFT JOIN withdraw_requests wr ON COALESCE(wh_debit.withdraw_request_id, wh.withdraw_request_id) = wr.id
        WHERE w.user_id = $1 AND wh.type = 'credit'
        ORDER BY wh.created_at DESC
        LIMIT 10
    `, [userId]);
    
    console.log("\n--- Wallet History (what the /wallet page shows, last 10) ---");
    console.table(walletHistory.rows.map(r => ({
        order_id: r.manual_order_id,
        price: r.price,
        detail_status: r.detail_status,
        has_withdrawal: !!r.withdraw_request_id,
        approved: !!r.approved_date
    })));

    // REAL balance calculation: sum of credits - sum of already-withdrawn (approved)
    const balance = await query(`SELECT balance FROM wallets WHERE user_id = $1`, [userId]);
    console.log(`\nActual wallet.balance field: $${balance.rows[0]?.balance}`);
    
    const creditSum = await query(`SELECT SUM(CAST(price AS NUMERIC)) as total FROM wallet_histories WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1) AND type = 'credit'`, [userId]);
    const debitSum = await query(`SELECT SUM(CAST(price AS NUMERIC)) as total FROM wallet_histories WHERE wallet_id = (SELECT id FROM wallets WHERE user_id = $1) AND type = 'debit'`, [userId]);
    console.log(`Credit total: $${creditSum.rows[0]?.total || 0}`);
    console.log(`Debit total: $${debitSum.rows[0]?.total || 0}`);
    
    // Check what the blogger wallet endpoint actually returns
    const walletRow = await query(`
        SELECT w.balance,
            (SELECT COALESCE(SUM(CAST(REGEXP_REPLACE(CAST(wh.price AS TEXT), '[^0-9.]', '', 'g') AS NUMERIC)), 0)
             FROM wallet_histories wh
             WHERE wh.wallet_id = w.id AND wh.type = 'credit') as total_earned,
            (SELECT COALESCE(SUM(CAST(REGEXP_REPLACE(CAST(wh2.price AS TEXT), '[^0-9.]', '', 'g') AS NUMERIC)), 0)
             FROM wallet_histories wh2
             WHERE wh2.wallet_id = w.id AND wh2.type = 'debit') as total_withdrawn
        FROM wallets w WHERE w.user_id = $1
    `, [userId]);
    console.log("\n--- Wallet summary (what getWallet returns) ---");
    console.table(walletRow.rows);
}

investigate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
