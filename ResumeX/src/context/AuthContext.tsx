'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  profile_type?: string;
  plan: string;
  created_at?: string;
  // Present on /auth/me responses
  has_password?: boolean;
  providers?: ('google' | 'github')[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
  };

  const signup = async (email: string, password: string) => {
    const data = await api.signup(email, password);
    setUser(data.user);
  };

  const loginWithToken = async (token: string) => {
    api.setToken(token);
    try {
      setUser(await api.getMe());
    } catch (error) {
      api.logout();
      throw error;
    }
  };

  const refreshUser = async () => {
    setUser(await api.getMe());
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithToken, refreshUser, logout }}>
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
