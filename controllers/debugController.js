const { query } = require('../config/database');
exports.debugWallet = async (req, res) => {
    const { email } = req.params;
    try {
        const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (!userRes.rows[0]) return res.json({error: 'user not found'});
        const userId = userRes.rows[0].id;
        
        const wh = await query(`
            SELECT wh.id, wh.type, wh.price, wh.wallet_id, wh.order_detail_id, 
                   nopd.status, no.order_id
            FROM wallet_histories wh
            LEFT JOIN new_order_process_details nopd ON wh.order_detail_id = nopd.id
            LEFT JOIN new_order_processes nop ON nopd.new_order_process_id = nop.id
            LEFT JOIN new_orders no ON nop.new_order_id = no.id
            WHERE wh.wallet_id = (SELECT id FROM wallets WHERE user_id = $1)
            ORDER BY wh.created_at DESC LIMIT 20
        `, [userId]);
        
        res.json(wh.rows);
    } catch(e) { res.status(500).json({error: e.message}); }
}
