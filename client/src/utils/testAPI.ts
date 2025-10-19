import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const testAPI = () => {
  console.log('🔍 API Configuration Test');
  console.log('Base URL:', API_BASE_URL);
  console.log('Register URL:', API_ENDPOINTS.REGISTER);
  console.log('Login URL:', API_ENDPOINTS.LOGIN);
  
  // Test the connection
  fetch(API_BASE_URL)
    .then(response => {
      console.log('✅ Server connection successful!');
      console.log('Response:', response.status);
    })
    .catch(error => {
      console.log('❌ Server connection failed:', error.message);
      console.log('Trying to connect to:', API_BASE_URL);
    });
};

export default testAPI;
