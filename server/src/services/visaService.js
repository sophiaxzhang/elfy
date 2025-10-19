import axios from 'axios';
import https from 'https';
import fs from 'fs';

// Visa Direct mTLS Agent
const createVisaAgent = () => {
  try {
    const certPath = process.env.VISA_CERT_PATH || 'cert.pem';
    const keyPath = process.env.VISA_KEY_PATH || 'key.pem';
    const caPath = process.env.VISA_CA_PATH || 'cert.cacert.pem';
    
    console.log('🔐 Loading certificates from:');
    console.log('- Cert:', certPath);
    console.log('- Key:', keyPath);
    console.log('- CA:', caPath);
    
    // Check if files exist
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificate file not found: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Key file not found: ${keyPath}`);
    }
    if (!fs.existsSync(caPath)) {
      throw new Error(`CA file not found: ${caPath}`);
    }
    
    return new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
      ca: fs.readFileSync(caPath),
    });
  } catch (error) {
    console.error('❌ Certificate loading error:', error.message);
    throw error;
  }
};

// Visa Direct Configuration
const VISA_CONFIG = {
  baseURL: process.env.VISA_API_BASE_URL || 'https://sandbox.api.visa.com',
  username: process.env.VISA_USERNAME,
  password: process.env.VISA_PASSWORD,
  timeout: 30000,
};

// Helper function to generate Visa Direct transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
};

// Helper function to build Visa Direct payload
const buildVisaPayload = (parentInfo, amount) => {
  const transactionId = generateTransactionId();
  
  return {
    systemsTraceAuditNumber: Math.floor(Math.random() * 900000) + 100000,
    retrievalReferenceNumber: transactionId,
    localTransactionDateTime: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
    acquiringBin: process.env.VISA_ACQUIRING_BIN,
    acquirerCountryCode: process.env.VISA_ACQUIRER_COUNTRY_CODE || '840',
    senderPrimaryAccountNumber: parentInfo.cardNumber,
    senderCardExpiryDate: parentInfo.cardExpiryDate,
    senderCurrencyCode: process.env.VISA_CURRENCY_CODE || '840',
    amount: amount.toString(),
    businessApplicationId: 'AA',
    cardAcceptor: {
      idCode: process.env.VISA_MERCHANT_ID,
      terminalId: process.env.VISA_TERMINAL_ID,
      name: 'Elfly Rewards',
      categoryCode: '5999',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA'
      }
    },
    pointOfServiceData: {
      panEntryMode: '05',
      pinEntryMode: '01',
      terminalEntryCapability: '05'
    }
  };
};

export const VisaService = {
  async processPayout(parentInfo, amount) {
    try {
      console.log('🚀 Starting Visa Direct payout process...');
      console.log('💰 Amount:', amount);
      console.log('👤 Parent:', parentInfo.name);
      
      // Check environment variables
      console.log('🔧 Environment check:');
      console.log('- VISA_USERNAME:', process.env.VISA_USERNAME ? '✅ Set' : '❌ Missing');
      console.log('- VISA_PASSWORD:', process.env.VISA_PASSWORD ? '✅ Set' : '❌ Missing');
      console.log('- VISA_API_BASE_URL:', process.env.VISA_API_BASE_URL || 'Using default');
      
      if (!process.env.VISA_USERNAME || !process.env.VISA_PASSWORD) {
        throw new Error('Missing Visa credentials in environment variables');
      }
      
      // Build Visa Direct payload
      console.log('📝 Building Visa payload...');
      const visaPayload = buildVisaPayload(parentInfo, amount);
      console.log('📋 Payload:', JSON.stringify(visaPayload, null, 2));
      
      // Create mTLS agent
      console.log('🔐 Creating mTLS agent...');
      const visaAgent = createVisaAgent();
      
      // Call Visa Direct API
      console.log('🌐 Calling Visa Direct API...');
      const apiUrl = `${VISA_CONFIG.baseURL}/visadirect/fundstransfer/v1/pullfundstransactions`;
      console.log('🔗 API URL:', apiUrl);
      
      const response = await axios.post(apiUrl, visaPayload, {
        httpsAgent: visaAgent,
        auth: {
          username: VISA_CONFIG.username,
          password: VISA_CONFIG.password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: VISA_CONFIG.timeout
      });
      
      console.log('✅ Visa API Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: response.data.actionCode === '00',
        transactionId: visaPayload.retrievalReferenceNumber,
        visaResponse: response.data,
        message: response.data.actionCode === '00' 
          ? 'Payout successful!' 
          : 'Payout failed. Please try again.'
      };
      
    } catch (error) {
      console.error('💥 Visa Direct API Error:', error.message);
      console.error('📊 Error details:', {
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        transactionId: generateTransactionId(),
        visaResponse: error.response?.data || null,
        message: 'Failed to process payout. Please try again.',
        error: error.message,
        errorCode: error.code
      };
    }
  }
};
