import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import type { User } from '../services/authService.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = authService.getCurrentToken();
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        try {
          // Verify session validity with backend
          const freshUser = await authService.getMe(storedToken);
          setToken(storedToken);
          setUser(freshUser);
          localStorage.setItem('anm_user', JSON.stringify(freshUser));
        } catch (error: any) {
          console.error('Session restoration failed:', error);
          // Token is likely expired or invalid; clear session
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      authService.logout();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
