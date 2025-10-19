// Test server connectivity
import { API_ENDPOINTS } from '../config/api';

const testServerConnection = async () => {
  try {
    console.log('Testing server connection...');
    console.log('Using URL:', API_ENDPOINTS.LOGIN);
    
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      console.log('✅ Server connection successful!');
      const data = await response.json();
      console.log('Response:', data);
    } else {
      console.log('❌ Server responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error instanceof Error ? error.message : String(error));
    console.log('Possible solutions:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check if URL is correct in api.ts');
    console.log('3. For physical device, use your computer\'s IP address');
    console.log('4. For emulator, use 10.0.2.2:3000');
  }
};

export default testServerConnection;
