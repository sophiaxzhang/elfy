import db from '../config/db.js';

export const PaymentModel = {
    async getPaymentMethodById(cardId, userId) {
        const result = await db.query(`
            SELECT pm.*, p.email as user_email
            FROM payment_methods pm
            JOIN parent p ON pm.user_id = p.id
            WHERE pm.id = $1 AND pm.user_id = $2
        `, [cardId, userId]);
        return result.rows[0];
    },

    async getPaymentMethodsByUserId(userId) {
        const result = await db.query(`
            SELECT id, card_number, expiry_date, cardholder_name, is_default, created_at
            FROM payment_methods
            WHERE user_id = $1
            ORDER BY is_default DESC, created_at DESC
        `, [userId]);
        return result.rows;
    },

    async createTransaction({ userId, paymentMethodId, amount, type, status, transactionId, externalReference, responseData }) {
        const result = await db.query(`
            INSERT INTO payment_transactions (
                user_id, payment_method_id, amount, type, status, 
                transaction_id, external_reference, response_data, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            RETURNING *
        `, [userId, paymentMethodId, amount, type, status, transactionId, externalReference, responseData]);
        return result.rows[0];
    },

    async getTransactionsByUserId(userId, limit = 10, offset = 0) {
        const result = await db.query(`
            SELECT 
                pt.*,
                pm.cardholder_name,
                pm.card_number,
                pm.expiry_date
            FROM payment_transactions pt
            LEFT JOIN payment_methods pm ON pt.payment_method_id = pm.id
            WHERE pt.user_id = $1
            ORDER BY pt.created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);
        return result.rows;
    },

    async getTransactionById(transactionId) {
        const result = await db.query(`
            SELECT 
                pt.*,
                pm.cardholder_name,
                pm.card_number,
                pm.expiry_date
            FROM payment_transactions pt
            LEFT JOIN payment_methods pm ON pt.payment_method_id = pm.id
            WHERE pt.transaction_id = $1
        `, [transactionId]);
        return result.rows[0];
    },

    async updateTransactionStatus(transactionId, status, responseData = null) {
        const result = await db.query(`
            UPDATE payment_transactions 
            SET status = $1, response_data = COALESCE($2, response_data), updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $3
            RETURNING *
        `, [status, responseData, transactionId]);
        return result.rows[0];
    }
};
