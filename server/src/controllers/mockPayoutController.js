// Mock test controller - add this to test without database
export const MockPayoutController = {
  async testTriggerPayout(req, res) {
    try {
      const { parentId, childId, amount } = req.body;
      
      console.log('🧪 Testing Visa Direct with mock data...');
      
      // Mock parent data
      const mockParent = {
        id: parentId,
        name: 'Test Parent',
        email: 'test@example.com',
        cardNumber: '4111111111111111', // Test Visa card
        cardExpiryDate: '1225', // MMYY format
        cardholderName: 'Test Parent',
        billingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        }
      };
      
      // Mock child data
      const mockChild = {
        id: childId,
        name: 'Test Child',
        gem: 15 // Has gems to trigger payout
      };
      
      console.log('📊 Mock Data:');
      console.log('- Parent:', mockParent.name);
      console.log('- Child:', mockChild.name, `(${mockChild.gem} gems)`);
      console.log('- Amount: $' + amount);
      
      // Test Visa service with mock data
      const { MockVisaService } = await import('../services/mockVisaService.js');
      const payoutResult = await MockVisaService.processPayout(mockParent, amount);
      
      console.log('💳 Visa Response:', payoutResult);
      
      res.json({
        success: payoutResult.success,
        transactionId: payoutResult.transactionId,
        visaResponse: payoutResult.visaResponse,
        message: payoutResult.message,
        mockData: {
          parent: mockParent.name,
          child: mockChild.name,
          gems: mockChild.gem,
          amount: amount
        }
      });
      
    } catch (error) {
      console.error('💥 Mock test error:', error);
      res.status(500).json({ 
        error: 'Mock test failed',
        message: error.message 
      });
    }
  }
};
