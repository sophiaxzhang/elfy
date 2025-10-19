// API Configuration
import { IP_ADDRESS, PORT } from '@env';

const API_CONFIG = {
  // For Android emulator
  ANDROID_BASE_URL: 'http://10.0.2.2:3000',
  
  // For iOS simulator
  IOS_BASE_URL: 'http://localhost:3000',
  
  // For physical device (using env variables)
  DEVICE_BASE_URL: `http://${IP_ADDRESS}:${PORT}`,
  
  // For web
  WEB_BASE_URL: 'http://localhost:3000'
};

// Get the appropriate base URL based on platform
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Web platform
    return API_CONFIG.WEB_BASE_URL;
  }
  
  // React Native platform detection
  const Platform = require('react-native').Platform;
  
  if (Platform.OS === 'android') {
    return API_CONFIG.ANDROID_BASE_URL;
  } else if (Platform.OS === 'ios') {
    return API_CONFIG.IOS_BASE_URL;
  }
  
  return API_CONFIG.WEB_BASE_URL;
};

export const API_BASE_URL = getBaseURL();

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/user/login`,
  REGISTER: `${API_BASE_URL}/user/`,
  PAYMENT_METHODS: `${API_BASE_URL}/payment/methods`,
  PUSH_FUNDS: `${API_BASE_URL}/payment/push-funds`,
  PULL_FUNDS: `${API_BASE_URL}/payment/pull-funds`,
  TRANSACTION_STATUS: `${API_BASE_URL}/payment/transaction`
};

export default API_CONFIG;
