import db from '../config/db.js';

export const UserModel = {
  async findByEmail(email){
    const result = await db.query('SELECT * FROM parent WHERE email = $1',
    [email]
  );
    return result.rows[0];
  },

  async create({ name, email, pin, password }) {
    const result = await db.query(`
      INSERT INTO parent (name, email, pin, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, pin
    `, [name, email, pin, password]);

    return result.rows[0];
  },

  async createChild({ name, parentId, gem }) {
    const result = await db.query(`
      INSERT INTO child (name, parent_id, gem)
      VALUES ($1, $2, $3)
      RETURNING id, name, parent_id, gem
    `, [name, parentId, gem]);
    return result.rows[0];
  },

  async updateTokenConfig({ userId, numberOfTokens, giftCardAmount }) {
    const result = await db.query(`
      UPDATE parent 
      SET number_of_tokens = $1, gift_card_amount = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, number_of_tokens, gift_card_amount
    `, [numberOfTokens, giftCardAmount, userId]);
    return result.rows[0];
  },

  async upsertParentInfo({ userId, email, password, pin }) {
    // First try to update
    let result = await db.query(`
      UPDATE parent 
      SET email = $1, password = $2, pin = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, pin
    `, [email, password, pin, userId]);
    
    // If no rows updated, create new record
    if (result.rows.length === 0) {
      result = await db.query(`
        INSERT INTO parent (id, email, password, pin)
        VALUES ($4, $1, $2, $3)
        RETURNING id, email, pin
      `, [email, password, pin, userId]);
    }
    
    return result.rows[0];
  },

  async createChildren({ children, parentId }) {
    const results = [];
    for (const child of children) {
      const result = await db.query(`
        INSERT INTO child (name, parent_id, gem)
        VALUES ($1, $2, $3)
        RETURNING id, name, parent_id, gem
      `, [child.name, parentId, 0]);
      results.push(result.rows[0]);
    }
    return results;
  },

  async createPaymentMethod({ userId, cardNumber, expiryDate, cvv, cardholderName, billingAddress }) {
    const result = await db.query(`
      INSERT INTO payment_methods (user_id, card_number, expiry_date, cvv, cardholder_name, billing_address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, card_number, expiry_date, cvv, cardholder_name, billing_address, is_default, created_at
    `, [userId, cardNumber, expiryDate, cvv, cardholderName, billingAddress]);
    return result.rows[0];
  }
};