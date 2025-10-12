import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  // Future AWS Cognito fields
  // groups?: string[];
  // cognitoId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // TODO: Replace with AWS Cognito Auth.currentAuthenticatedUser()
        const storedUser = localStorage.getItem('vault_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        localStorage.removeItem('vault_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with AWS Cognito Auth.signIn()
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (email === 'demo@vault.com' && password === 'Password123!') {
        const user = { 
          id: '1', 
          email, 
          name: 'Demo User'
        };
        setUser(user);
        localStorage.setItem('vault_user', JSON.stringify(user));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with AWS Cognito Auth.signUp()
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = { 
        id: Date.now().toString(), 
        email, 
        name 
      };
      setUser(user);
      localStorage.setItem('vault_user', JSON.stringify(user));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // TODO: Replace with AWS Cognito Auth.signOut()
    setUser(null);
    localStorage.removeItem('vault_user');
  };

  const resetPassword = async (email: string): Promise<void> => {
    // TODO: Replace with AWS Cognito Auth.forgotPassword()
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset sent to ${email}`);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};