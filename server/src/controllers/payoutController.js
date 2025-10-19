import db from '../config/db.js';
import { MockVisaService } from '../services/mockVisaService.js';

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
      
      // Fetch parent and child information (skip payment method query for MVP)
      const [parentResult, childResult] = await Promise.all([
        db.query('SELECT * FROM parent WHERE id = $1', [parentId]),
        db.query('SELECT * FROM child WHERE id = $1', [childId])
      ]);
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent not found' });
      }
      
      if (childResult.rows.length === 0) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      const parent = parentResult.rows[0];
      const child = childResult.rows[0];
      
      // For MVP: Always use mock payment data for Visa processing
      // (Even though we collect real payment data during signup, we don't use it for processing)
      console.log('🎯 MVP Mode: Using mock payment data for Visa processing');
      const mockPaymentMethod = {
        card_number: '4111111111111111',
        expiry_date: '1225',
        cardholder_name: parent.name,
        billing_address: '123 Mock Street, Mock City, MC 12345'
      };
      
      // Prepare parent info with mock payment method for Visa API
      const parentWithPayment = {
        ...parent,
        cardNumber: mockPaymentMethod.card_number,
        cardExpiryDate: mockPaymentMethod.expiry_date,
        cardholderName: mockPaymentMethod.cardholder_name,
        billingAddress: mockPaymentMethod.billing_address
      };
      
          // Check if child has reached their goal (using existing gem field)
          // Note: You'll need to implement goal logic based on your business rules
          // For now, we'll assume goal is reached if child has gems > 0
          if (!child.gem || child.gem <= 0) {
            return res.status(400).json({ 
              error: 'Child has not earned any gems yet' 
            });
          }
      
      // Process payout through Mock Visa Direct (for testing)
      const payoutResult = await MockVisaService.processPayout(parentWithPayment, amount);
      
      // For MVP: Skip database logging to avoid payments table dependency
      console.log('🎉 Mock payout result:', payoutResult);
      
      // Reset child's gems if payout was successful
      if (payoutResult.success) {
        await db.query(
          'UPDATE child SET gem = 0 WHERE id = $1',
          [childId]
        );
        console.log('✅ Child gems reset to 0');
      }
      
      res.json({
        success: payoutResult.success,
        transactionId: payoutResult.transactionId,
        visaResponse: payoutResult.visaResponse,
        message: payoutResult.message
      });
      
    } catch (error) {
      console.error('Error processing payout:', error);
      
      // For MVP: Skip database error logging
      console.log('❌ Payout failed:', error.message);
      
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process payout. Please try again.'
      });
    }
  },

  async getTransactionHistory(req, res) {
    try {
      const { parentId } = req.params;
      
      // For MVP: Return mock transaction history
      const mockTransactions = [
        {
          id: 1,
          user_id: parentId,
          transaction_id: 'MOCK' + Date.now(),
          amount: 10.00,
          currency: 'USD',
          status: 'completed',
          payment_type: 'visa_direct',
          created_at: new Date().toISOString(),
          child_name: 'Sample Child'
        }
      ];
      
      res.json(mockTransactions);
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
