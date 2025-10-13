import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  mfaEnabled: boolean;
  // Future AWS Cognito fields
  // groups?: string[];
  // cognitoId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requiresMFA: boolean;
  pendingMFAUser: { email: string; tempToken: string } | null;
  login: (email: string, password: string) => Promise<void>;
  verifyMFA: (code: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  setupMFA: () => Promise<{ qrCode: string; secret: string }>;
  confirmMFASetup: (code: string) => Promise<void>;
  disableMFA: (code: string) => Promise<void>;
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
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [pendingMFAUser, setPendingMFAUser] = useState<{ email: string; tempToken: string } | null>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // TODO: Replace with AWS Cognito Auth.currentAuthenticatedUser()
        const storedUser = localStorage.getItem('authToken');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        localStorage.removeItem('authToken');
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
      
      if (email === 'demo@heimdall.com' && password === 'Password123!') {
        // Simulate user with MFA enabled
        const tempUser = { 
          id: '1', 
          email, 
          name: 'Demo User',
          mfaEnabled: true
        };
        
        // Set pending MFA state instead of logging in directly
        setPendingMFAUser({ 
          email, 
          tempToken: 'temp_' + Date.now() 
        });
        setRequiresMFA(true);
        
        // Don't set user or save to localStorage yet - wait for MFA
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (code: string): Promise<void> => {
    if (!pendingMFAUser) {
      throw new Error('No pending MFA verification');
    }

    setIsLoading(true);
    try {
      // TODO: Replace with AWS Cognito Auth.confirmSignIn()
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock MFA verification - accept "123456" as valid code
      if (code === '123456') {
        const user = { 
          id: '1', 
          email: pendingMFAUser.email, 
          name: 'Demo User',
          mfaEnabled: true
        };
        
        setUser(user);
        localStorage.setItem('authToken', JSON.stringify(user));
        
        // Clear MFA state
        setRequiresMFA(false);
        setPendingMFAUser(null);
      } else {
        throw new Error('Invalid MFA code');
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
        name,
        mfaEnabled: false // New users start without MFA
      };
      setUser(user);
      localStorage.setItem('authToken', JSON.stringify(user));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // TODO: Replace with AWS Cognito Auth.signOut()
    setUser(null);
    setRequiresMFA(false);
    setPendingMFAUser(null);
    localStorage.removeItem('authToken');
  };

  const resetPassword = async (email: string): Promise<void> => {
    // TODO: Replace with AWS Cognito Auth.forgotPassword()
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset sent to ${email}`);
  };

  const setupMFA = async (): Promise<{ qrCode: string; secret: string }> => {
    // TODO: Replace with AWS Cognito MFA setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock QR code and secret for TOTP setup
    const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
    const qrCode = `otpauth://totp/Heimdall:${user?.email}?secret=${secret}&issuer=Heimdall`;
    
    return { qrCode, secret };
  };

  const confirmMFASetup = async (code: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // TODO: Replace with AWS Cognito MFA confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (code === '123456') { // Mock validation
        const updatedUser = { ...user, mfaEnabled: true };
        setUser(updatedUser);
        localStorage.setItem('authToken', JSON.stringify(updatedUser));
      } else {
        throw new Error('Invalid MFA code');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async (code: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // TODO: Replace with AWS Cognito MFA disable
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (code === '123456') { // Mock validation
        const updatedUser = { ...user, mfaEnabled: false };
        setUser(updatedUser);
        localStorage.setItem('authToken', JSON.stringify(updatedUser));
      } else {
        throw new Error('Invalid MFA code');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    requiresMFA,
    pendingMFAUser,
    login,
    verifyMFA,
    register,
    logout,
    resetPassword,
    setupMFA,
    confirmMFASetup,
    disableMFA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};