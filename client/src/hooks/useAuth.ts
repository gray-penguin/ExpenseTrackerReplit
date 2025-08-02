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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<AuthCredentials>(DEFAULT_CREDENTIALS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from IndexedDB
  useEffect(() => {
    const initAuth = async () => {
      try {
        await indexedDBStorage.init();
        await indexedDBStorage.initializeMockData();
        
        const [authState, savedCredentials] = await Promise.all([
          indexedDBStorage.getAuthState(),
          indexedDBStorage.getCredentials()
        ]);
        
        setIsAuthenticated(authState);
        setCredentials(savedCredentials);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Save credentials to IndexedDB when they change
  useEffect(() => {
    if (!isLoading) {
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
    // Force refresh to ensure clean state
    window.location.reload();
  };

  const updateCredentials = (newCredentials: Partial<AuthCredentials>) => {
    setCredentials(prev => ({ ...prev, ...newCredentials }));
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