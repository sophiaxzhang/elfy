import axios from 'axios';

// Test script for Visa Direct integration
const testVisaIntegration = async () => {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  // Mock JWT token - replace with actual token from your auth system
  const mockToken = 'mock-jwt-token';
  
  try {
    console.log('🧪 Testing Visa Direct Integration...\n');
    
    // Test 1: Get parent info
    console.log('1. Testing getParentInfo...');
    try {
      const parentResponse = await axios.get(`${API_BASE_URL}/parent/1`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Parent info:', parentResponse.data);
    } catch (error) {
      console.log('❌ Parent info error:', error.response?.data || error.message);
    }
    
    // Test 2: Get child info
    console.log('\n2. Testing getChildInfo...');
    try {
      const childResponse = await axios.get(`${API_BASE_URL}/child/1`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Child info:', childResponse.data);
    } catch (error) {
      console.log('❌ Child info error:', error.response?.data || error.message);
    }
    
    // Test 3: Trigger payout
    console.log('\n3. Testing triggerPayout...');
    try {
      const payoutResponse = await axios.post(`${API_BASE_URL}/trigger-payout`, {
        parentId: '1',
        childId: '1',
        amount: 10
      }, {
        headers: { 
          Authorization: `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Payout response:', payoutResponse.data);
    } catch (error) {
      console.log('❌ Payout error:', error.response?.data || error.message);
    }
    
    // Test 4: Get transaction history
    console.log('\n4. Testing getTransactionHistory...');
    try {
      const historyResponse = await axios.get(`${API_BASE_URL}/transactions/1`, {
        headers: { Authorization: `Bearer ${mockToken}` }
      });
      console.log('✅ Transaction history:', historyResponse.data);
    } catch (error) {
      console.log('❌ Transaction history error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

// Run the test
testVisaIntegration();
