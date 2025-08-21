import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  isAdmin?: boolean;
  settings?: {
    notifications: boolean;
    language: string;
    currency: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse: any = await authApi.login(email, password);
      localStorage.setItem('token', loginResponse.token);
      setIsAuthenticated(true);
      
      // Set user data from response - handle both possible response formats
      const userData = loginResponse.user || loginResponse;
      const userForContext = {
        id: userData.id || userData._id,
        username: userData.username,
        email: userData.email,
        profilePicture: userData.profilePicture || '',
        isAdmin: userData.isAdmin || false
      };
      
      setUser(userForContext);
      localStorage.setItem('user', JSON.stringify(userForContext));
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await authApi.register(username, email, password);
      
      // After successful registration, log the user in automatically
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
