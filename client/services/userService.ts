import axios from 'axios';
import { storeToken, getToken, storeRefreshToken, getRefreshToken, clearTokens } from './authService';
import { IP_ADDRESS, PORT } from '@env';

const API_BASE_URL = `http://100.110.184.54:3000`;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/user/refresh-token`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          await storeToken(accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await clearTokens();
        throw refreshError;
      }
    }
    
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  pin: number;
  number_of_tokens?: number;
}

export interface Child {
  id: number;
  name: string;
  parent_id: number;
  gem: number;
}

export interface LoginResponse {
  success: boolean;
  user: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  pin: number;
  password: string;
}

export interface CreateChildRequest {
  name: string;
  parentId: number;
  gem: number;
}

export const UserService = {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.user;
        await storeToken(accessToken);
        await storeRefreshToken(refreshToken);
        
        return {
          success: true,
          user: { accessToken, refreshToken, user }
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  async register(userData: CreateUserRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/user`, userData);
      
      const { accessToken, refreshToken, user } = response.data;
      await storeToken(accessToken);
      await storeRefreshToken(refreshToken);
      
      return {
        success: true,
        user: { accessToken, refreshToken, user }
      };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // User Management
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await getToken();
      if (!token) return null;
      
      // Decode the JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      
      // Use the family data endpoint to get current user info
      const response = await api.get(`/user/family/${userId}`);
      return response.data.family.parent;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Child Management
  async createChild(childData: CreateChildRequest): Promise<Child> {
    try {
      const response = await api.post('/user/child', childData);
      return response.data;
    } catch (error: any) {
      console.error('Create child error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getChildren(parentId: number): Promise<Child[]> {
    try {
      // You'll need to add this endpoint to your backend
      const response = await api.get(`/api/children/${parentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get children error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getChild(childId: number): Promise<Child> {
    try {
      const response = await api.get(`/api/child/${childId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get child error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateChild(childId: number, updates: Partial<Child>): Promise<Child> {
    try {
      const response = await api.put(`/api/child/${childId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Update child error:', error.response?.data || error.message);
      throw error;
    }
  },

  async validatePin(userId: number, pin: string): Promise<boolean> {
    try {
      const response = await api.post('/user/validate-pin', { userId, pin });
      return response.data.isValid;
    } catch (error: any) {
      console.error('Validate PIN error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getFamilyData(userId: number): Promise<{ parent: User; children: Child[] }> {
    try {
      const response = await api.get(`/user/family/${userId}`);
      return response.data.family;
    } catch (error: any) {
      console.error('Get family data error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateChildGems(childId: number, gemsToAdd: number): Promise<any> {
    try {
      const response = await api.put('/user/child-gems', { childId, gemsToAdd });
      return response.data;
    } catch (error: any) {
      console.error('Update child gems error:', error.response?.data || error.message);
      throw error;
    }
  }
};
