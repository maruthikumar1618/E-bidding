import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export type UserRole = 'SELLER' | 'BIDDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing user token and fetch user data
    const token = localStorage.getItem('nexus_token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCurrentUser();
      setUser((response as any).user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Clear invalid token
      localStorage.removeItem('nexus_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.login({ email, password });
      const user = (response as any).user;
      setUser(user);
      localStorage.setItem('nexus_token', (response as any).token);
      return user; // Return user so caller can use it
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.register({ email, password, name, role });
      const user = (response as any).user;
      setUser(user);
      localStorage.setItem('nexus_token', (response as any).token);
      return user; // Return user so caller can use it
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('nexus_token');
    apiClient.clearToken();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};