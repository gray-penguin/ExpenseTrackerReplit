import { useState, useEffect } from 'react';
import { indexedDBStorage } from '../utils/indexedDBStorage';

interface AuthCredentials {
  username: string;
  password: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  useCase: string;
  authEnabled: boolean;
}

const DEFAULT_CREDENTIALS: AuthCredentials = {
  username: 'admin',
  password: 'pass123',
  email: 'admin@example.com',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'blue',
  useCase: 'family-expenses',
  authEnabled: true
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
          useCase: savedCredentials?.useCase || 'personal-team',
          authEnabled: savedCredentials?.authEnabled !== undefined ? savedCredentials.authEnabled : true
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
          useCase: 'family-expenses',
          authEnabled: true
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
    // If auth is disabled, always allow login
    if (!credentials.authEnabled) {
      indexedDBStorage.setAuthState(true);
      setIsAuthenticated(true);
      return true;
    }
    
    if (username === credentials.username && password === credentials.password) {
      indexedDBStorage.setAuthState(true);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const toggleAuth = (enabled: boolean) => {
    const updatedCredentials = { ...credentials, authEnabled: enabled };
    setCredentials(updatedCredentials);
    
    // If disabling auth and user is not authenticated, auto-authenticate
    if (!enabled && !isAuthenticated) {
      indexedDBStorage.setAuthState(true);
      setIsAuthenticated(true);
    }
    
    // If enabling auth and user was auto-authenticated, log them out
    if (enabled && isAuthenticated) {
      // Only log out if they haven't manually logged in
      const wasAutoAuthenticated = !credentials.authEnabled;
      if (wasAutoAuthenticated) {
        indexedDBStorage.setAuthState(false);
        setIsAuthenticated(false);
      }
    }
  };

  const logout = () => {
    try {
      indexedDBStorage.setAuthState(false);
      setIsAuthenticated(false);
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force reload even if there's an error
      window.location.reload();
    }
  };

  const updateCredentials = (newCredentials: Partial<AuthCredentials>) => {
    const updatedCredentials = { ...credentials, ...newCredentials };
    console.log('Auth: updateCredentials called with:', newCredentials);
    console.log('Auth: Updated credentials will be:', updatedCredentials);
    console.log('Auth: Current use case before update:', credentials.useCase);
    console.log('Auth: New use case after update:', updatedCredentials.useCase);
    
    setCredentials(updatedCredentials);
    
    // Immediately save to IndexedDB to ensure persistence
    indexedDBStorage.setCredentials(updatedCredentials).then(() => {
      console.log('Auth: Credentials saved to IndexedDB successfully');
      
      // Verify the save by reading back the data
      indexedDBStorage.getCredentials().then(savedCreds => {
        console.log('Auth: Verification - credentials read back from IndexedDB:', savedCreds);
        console.log('Auth: Verification - use case in saved credentials:', savedCreds.useCase);
      });
      
      // If use case changed, force a page reload to ensure all components update
      if (newCredentials.useCase && newCredentials.useCase !== credentials.useCase) {
        console.log('Auth: Use case changed, forcing page reload');
        console.log('Auth: Use case changed from', credentials.useCase, 'to', newCredentials.useCase);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }).catch(error => {
      console.error('Auth: Error saving credentials to IndexedDB:', error);
    });
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
    toggleAuth,
    verifySecurityAnswer,
    resetPassword,
    sendPasswordResetEmail
  };
}