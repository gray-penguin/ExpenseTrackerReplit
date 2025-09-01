export interface DefaultCredentials {
  username: string;
  password: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  useCase: string;
  authEnabled: boolean;
}

export const defaultCredentials: DefaultCredentials = {
  username: 'admin',
  password: 'pass123',
  email: 'admin@example.com',
  securityQuestion: 'What is your favorite color?',
  securityAnswer: 'blue',
  useCase: 'family-expenses',
  authEnabled: true
};

export const defaultSettings = {
  fontSize: 'small',
  auth: 'false'
};