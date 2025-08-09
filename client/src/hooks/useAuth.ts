import { useState, useEffect } from 'react';
import { indexedDBStorage } from '../utils/indexedDBStorage';

interface AuthCredentials {
  username: string;
  password: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  useCase: string;
}

const DEFAULT_CREDENTIALS: AuthCredentials = {
  username: 'admin',
  password: 'pass123',
  email: 'admin@example.com',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'blue',
  useCase: 'personal-team'
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<AuthCredentials>(DEFAULT_CREDENTIALS);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const [authState, savedCredentials] = await Promise.all([
          indexedDBStorage.getAuthState(),
          indexedDBStorage.getCredentials(),
        ]);
        
        console.log('Auth: Retrieved auth state and credentials', { authState, savedCredentials });
        setIsAuthenticated(authState);
        
        // Ensure we have all required credential fields
        const completeCredentials = {
          username: savedCredentials?.username || 'admin',
          password: savedCredentials?.password || 'pass123',
          email: savedCredentials?.email || 'admin@example.com',
          securityQuestion: savedCredentials?.securityQuestion || 'What is your favorite color?',
          securityAnswer: savedCredentials?.securityAnswer || 'blue',
          useCase: savedCredentials?.useCase || 'personal-team'
        };
        
        console.log('Auth: Setting complete credentials with use case:', completeCredentials.useCase);
        setCredentials(completeCredentials);
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Set fallback values
        setIsAuthenticated(false);
        setCredentials({
          username: 'admin',
          password: 'pass123',
          email: 'admin@example.com',
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue',
          useCase: 'personal-team'
        });
      } finally {
        console.log('Auth: Initialization complete, setting loading to false');
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Save credentials to IndexedDB when they change
  useEffect(() => {
    if (!isLoading) {
      console.log('Auth: Saving credentials to IndexedDB:', credentials);
      indexedDBStorage.setCredentials(credentials).catch(error => {
        console.error('Error saving credentials:', error);
      });
    }
  }, [credentials, isLoading]);

  const login = (username: string, password: string): boolean => {
    if (username === credentials.username && password === credentials.password) {
      indexedDBStorage.setAuthState(true);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    indexedDBStorage.setAuthState(false);
    setIsAuthenticated(false);
  };

  const updateCredentials = (newCredentials: Partial<AuthCredentials>) => {
    setCredentials(prev => ({ ...prev, ...newCredentials }));
    
    // If use case is being updated, trigger a re-render by updating localStorage immediately
    if (newCredentials.useCase) {
      // Force immediate update to trigger component re-renders
      const updatedCreds = { ...credentials, ...newCredentials };
      setCredentials(updatedCreds);
    }
  };

  const verifySecurityAnswer = (answer: string): boolean => {
    return answer.toLowerCase().trim() === credentials.securityAnswer.toLowerCase().trim();
  };

  const resetPassword = (newPassword: string): boolean => {
    try {
      setCredentials(prev => ({ ...prev, password: newPassword }));
      return true;
    } catch {
      return false;
    }
  };

  const sendPasswordResetEmail = (email: string): boolean => {
    // Simulate email sending - in a real app, this would call an API
    return email.toLowerCase() === credentials.email.toLowerCase();
  };

  return {
    isAuthenticated,
    isLoading,
    credentials,
    login,
    logout,
    updateCredentials,
    verifySecurityAnswer,
    resetPassword,
    sendPasswordResetEmail
  };
}