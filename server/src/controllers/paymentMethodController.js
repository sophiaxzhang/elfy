import db from '../config/db.js';

export const PaymentMethodController = {
  async createPaymentMethod(req, res) {
    try {
      const { 
        userId, 
        cardNumber, 
        expiryDate, 
        cvv, 
        cardholderName, 
        billingAddress,
        isDefault = false 
      } = req.body;

      // Validate required fields
      if (!userId || !cardNumber || !expiryDate || !cvv || !cardholderName) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, cardNumber, expiryDate, cvv, cardholderName' 
        });
      }

      // If setting as default, unset other defaults first
      if (isDefault) {
        await db.query(
          'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      // Create payment method
      const result = await db.query(
        `INSERT INTO payment_methods (user_id, card_number, expiry_date, cvv, cardholder_name, billing_address, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, card_number, expiry_date, cardholder_name, billing_address, is_default, created_at`,
        [userId, cardNumber, expiryDate, cvv, cardholderName, billingAddress, isDefault]
      );

      res.status(201).json({
        success: true,
        paymentMethod: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating payment method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserPaymentMethods(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await db.query(
        'SELECT id, card_number, expiry_date, cardholder_name, billing_address, is_default, created_at FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
      );

      res.json({
        success: true,
        paymentMethods: result.rows
      });

    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async setDefaultPaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Unset all other defaults for this user
      await db.query(
        'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set this one as default
      const result = await db.query(
        'UPDATE payment_methods SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }

      res.json({
        success: true,
        paymentMethod: result.rows[0]
      });

    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const result = await db.query(
        'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }

      res.json({
        success: true,
        message: 'Payment method deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
