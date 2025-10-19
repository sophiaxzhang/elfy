import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserService, User } from '../services/userService';
import { getToken } from '../services/authService';

interface AuthProps {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string, pin: number) => Promise<any>;
  // authState?: {token: string | null; authenticated: boolean | null};
  user?: {name: string, email: string, password: string | null, id: number} | null;
  setUser: (user: any) => void;
  register: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthProps | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      if (token) {
        const currentUser = await UserService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await UserService.login(email, password);
      if (result.success) {
        setUser(result.user.user);
        return result.user;
      } else {
        throw new Error('Login failed');
      }
        const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email, password}),
          });
    
        if (!response.ok) {
          throw new Error("invalid login")
        } 
    
        const data = await response.json();
        console.log("login user data", data.user);
        setUser(data.user);
        console.log("storing token");

        console.log("access token type: ", typeof (data.user.accessToken));
        console.log("refresh token type: ", typeof (data.user.refreshToken));
        await storeToken(data.user.accessToken);
        await storeRefreshToken(data.user.refreshToken);
        return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, pin: number) => {
    try {
      setIsLoading(true);
      const result = await UserService.register({ name, email, password, pin });
      if (result.success) {
        setUser(result.user.user);
        return result.user;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await UserService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      refreshUser 
    }}>
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);