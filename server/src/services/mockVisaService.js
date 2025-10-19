// Mock Visa service for testing without real credentials
export const MockVisaService = {
  async processPayout(parentInfo, amount) {
    console.log('🧪 Mock Visa Service - Simulating payout...');
    console.log('💰 Amount:', amount);
    console.log('👤 Parent:', parentInfo.name);
    console.log('💳 Card:', parentInfo.cardNumber);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Always return success for testing
    const success = true; // 100% success rate for testing
    
    if (success) {
      console.log('✅ Mock payout successful!');
      return {
        success: true,
        transactionId: 'MOCK' + Date.now(),
        visaResponse: {
          actionCode: '00',
          responseCode: '00',
          responseMessage: 'Approved',
          transactionIdentifier: 'MOCK' + Date.now()
        },
        message: 'Mock payout successful!'
      };
    } else {
      console.log('❌ Mock payout failed');
      return {
        success: false,
        transactionId: 'MOCK' + Date.now(),
        visaResponse: {
          actionCode: '05',
          responseCode: '05',
          responseMessage: 'Do not honor'
        },
        message: 'Mock payout failed - Do not honor'
      };
    }
  }
};
