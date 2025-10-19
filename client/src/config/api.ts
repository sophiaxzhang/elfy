// API Configuration
import { IP_ADDRESS, PORT } from '@env';

const API_CONFIG = {
  // For Android emulator
  ANDROID_BASE_URL: 'http://10.0.2.2:3000',
  
  // For iOS simulator
  IOS_BASE_URL: 'http://localhost:3000',
  
  // For physical device (using env variables or fallback)
  DEVICE_BASE_URL: IP_ADDRESS ? `http://${IP_ADDRESS}:${PORT || 3000}` : 'http://100.110.184.54:3000',
  
  // For web
  WEB_BASE_URL: 'http://localhost:3000'
};

// Get the appropriate base URL based on platform
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Web platform
    console.log('🌐 Using WEB_BASE_URL:', API_CONFIG.WEB_BASE_URL);
    return API_CONFIG.WEB_BASE_URL;
  }
  
  // React Native platform detection
  const Platform = require('react-native').Platform;
  
  if (Platform.OS === 'android') {
    console.log('🤖 Using ANDROID_BASE_URL:', API_CONFIG.ANDROID_BASE_URL);
    return API_CONFIG.ANDROID_BASE_URL;
  } else if (Platform.OS === 'ios') {
    console.log('🍎 Using IOS_BASE_URL:', API_CONFIG.IOS_BASE_URL);
    return API_CONFIG.IOS_BASE_URL;
  }
  
  console.log('❓ Using fallback WEB_BASE_URL:', API_CONFIG.WEB_BASE_URL);
  return API_CONFIG.WEB_BASE_URL;
};

// For debugging - try different URLs based on platform
const DEBUG_MODE = true;
const getDebugBaseURL = () => {
  if (typeof window !== 'undefined') {
    console.log('🐛 DEBUG MODE: Using localhost:3000 (web)');
    return 'http://localhost:3000';
  }
  
  const Platform = require('react-native').Platform;
  
  if (Platform.OS === 'android') {
    console.log('🐛 DEBUG MODE: Using 100.110.184.54:3000 (Android emulator)');
    return 'http://100.110.184.54:3000';
  } else if (Platform.OS === 'ios') {
    console.log('🐛 DEBUG MODE: Using localhost:3000 (iOS simulator)');
    return 'http://localhost:3000';
  }
  
  console.log('🐛 DEBUG MODE: Using localhost:3000 (fallback)');
  return 'http://localhost:3000';
};

export const API_BASE_URL = DEBUG_MODE ? getDebugBaseURL() : getBaseURL();

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/user/login`,
  REGISTER: `${API_BASE_URL}/user/`,
  PAYMENT_METHODS: `${API_BASE_URL}/payment/methods`,
  PUSH_FUNDS: `${API_BASE_URL}/payment/push-funds`,
  PULL_FUNDS: `${API_BASE_URL}/payment/pull-funds`,
  TRANSACTION_STATUS: `${API_BASE_URL}/payment/transaction`,
  AI_TASK_SUGGESTIONS: `${API_BASE_URL}/api/ai/suggestions`,
  AI_CONTEXTUAL_SUGGESTIONS: `${API_BASE_URL}/api/ai/suggestions/contextual`
};

export default API_CONFIG;
