import { useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authState = localStorage.getItem('expense-tracker-auth');
      return authState === 'true';
    } catch {
      return false;
    }
  });

  const [credentials, setCredentials] = useState<AuthCredentials>(() => {
    try {
      const saved = localStorage.getItem('expense-tracker-credentials');
      return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS;
    } catch {
      return DEFAULT_CREDENTIALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('expense-tracker-credentials', JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }, [credentials]);

  const login = (username: string, password: string): boolean => {
    if (username === credentials.username && password === credentials.password) {
      localStorage.setItem('expense-tracker-auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('expense-tracker-auth');
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
    credentials,
    login,
    logout,
    updateCredentials,
    verifySecurityAnswer,
    resetPassword,
    sendPasswordResetEmail
  };
}