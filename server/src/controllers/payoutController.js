import db from '../config/db.js';
import { VisaService } from '../services/visaService.js';

export const PayoutController = {
  async triggerPayout(req, res) {
    try {
      const { parentId, childId, amount } = req.body;
      
      // Validate input
      if (!parentId || !childId || !amount) {
        return res.status(400).json({ 
          error: 'Missing required fields: parentId, childId, amount' 
        });
      }
      
      // Fetch parent, child, and payment method information
      const [parentResult, childResult, paymentMethodResult] = await Promise.all([
        db.query('SELECT * FROM parent WHERE id = $1', [parentId]),
        db.query('SELECT * FROM child WHERE id = $1', [childId]),
        db.query('SELECT * FROM payment_methods WHERE user_id = $1 AND is_default = true LIMIT 1', [parentId])
      ]);
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent not found' });
      }
      
      if (childResult.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      if (paymentMethodResult.rows.length === 0) {
        return res.status(400).json({ error: 'No default payment method found for parent' });
      }
      
      const parent = parentResult.rows[0];
      const child = childResult.rows[0];
      const paymentMethod = paymentMethodResult.rows[0];
      
      // Prepare parent info with payment method for Visa API
      const parentWithPayment = {
        ...parent,
        cardNumber: paymentMethod.card_number,
        cardExpiryDate: paymentMethod.expiry_date,
        cardholderName: paymentMethod.cardholder_name,
        billingAddress: paymentMethod.billing_address
      };
      
          // Check if child has reached their goal (using existing gem field)
          // Note: You'll need to implement goal logic based on your business rules
          // For now, we'll assume goal is reached if child has gems > 0
          if (!child.gem || child.gem <= 0) {
            return res.status(400).json({ 
              error: 'Child has not earned any gems yet' 
            });
          }
      
      // Process payout through Visa Direct
      const payoutResult = await VisaService.processPayout(parentWithPayment, amount);
      
      // Log the transaction in your existing payments table
      await db.query(
        `INSERT INTO payments (user_id, transaction_id, amount, currency, status, payment_type, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          parentId,
          payoutResult.transactionId,
          amount,
          'USD',
          payoutResult.success ? 'completed' : 'failed',
          'visa_direct',
          new Date().toISOString()
        ]
      );
      
      // Reset child's gems if payout was successful
      if (payoutResult.success) {
        await db.query(
          'UPDATE child SET gem = 0 WHERE id = $1',
          [childId]
        );
      }
      
      res.json({
        success: payoutResult.success,
        transactionId: payoutResult.transactionId,
        visaResponse: payoutResult.visaResponse,
        message: payoutResult.message
      });
      
    } catch (error) {
      console.error('Error processing payout:', error);
      
      // Log error transaction
      if (req.body.parentId && req.body.childId && req.body.amount) {
        try {
          await db.query(
            `INSERT INTO payments (user_id, transaction_id, amount, currency, status, payment_type, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              req.body.parentId,
              'TXN' + Date.now() + Math.random().toString(36).substr(2, 9),
              req.body.amount,
              'USD',
              'error',
              'visa_direct',
              new Date().toISOString()
            ]
          );
        } catch (logError) {
          console.error('Error logging failed transaction:', logError);
        }
      }
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process payout. Please try again.'
      });
    }
  },

  async getTransactionHistory(req, res) {
    try {
      const { parentId } = req.params;
      const result = await db.query(
        `SELECT p.*, c.name as child_name 
         FROM payments p 
         LEFT JOIN child c ON p.user_id = c.parent_id 
         WHERE p.user_id = $1 
         ORDER BY p.created_at DESC`,
        [parentId]
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getParentInfo(req, res) {
    try {
      const { parentId } = req.params;
      const result = await db.query(
        'SELECT * FROM parent WHERE id = $1',
        [parentId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Parent not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching parent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getChildInfo(req, res) {
    try {
      const { childId } = req.params;
      const result = await db.query(
        'SELECT * FROM child WHERE id = $1',
        [childId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching child:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
