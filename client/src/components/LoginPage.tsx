import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, BarChart3, Shield, AlertCircle, Mail, HelpCircle, ArrowLeft, CheckCircle, Send } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onSendPasswordReset?: (email: string) => boolean;
  onVerifySecurityAnswer?: (answer: string) => boolean;
  onResetPassword?: (newPassword: string) => boolean;
  userEmail?: string;
  securityQuestion?: string;
}

type LoginStep = 'login' | 'forgot-password' | 'security-question' | 'reset-password' | 'reset-success';

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  onSendPasswordReset,
  onVerifySecurityAnswer,
  onResetPassword,
  userEmail,
  securityQuestion
}) => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    const success = onLogin(username.trim(), password);
    
    if (!success) {
      setError('Invalid username or password');
      setPassword(''); // Clear password on failed attempt
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!onSendPasswordReset) {
      setError('Password reset functionality is not available');
      setIsLoading(false);
      return;
    }

    const success = onSendPasswordReset(email.trim());
    
    if (success) {
      setCurrentStep('security-question');
    } else {
      setError('Email address not found. Please check and try again.');
    }
    
    setIsLoading(false);
  };

  const handleSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (!securityAnswer.trim()) {
      setError('Please answer the security question');
      setIsLoading(false);
      return;
    }

    if (!onVerifySecurityAnswer) {
      setError('Security verification is not available');
      setIsLoading(false);
      return;
    }

    const success = onVerifySecurityAnswer(securityAnswer.trim());
    
    if (success) {
      setCurrentStep('reset-password');
    } else {
      setError('Incorrect answer. Please try again.');
      setSecurityAnswer('');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!onResetPassword) {
      setError('Password reset functionality is not available');
      setIsLoading(false);
      return;
    }

    const success = onResetPassword(newPassword);
    
    if (success) {
      setCurrentStep('reset-success');
    } else {
      setError('Failed to reset password. Please try again.');
    }
    
    setIsLoading(false);
  };

  const resetToLogin = () => {
    setCurrentStep('login');
    setEmail('');
    setSecurityAnswer('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const renderLoginForm = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Please sign in to continue</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your username"
              disabled={isLoading}
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setCurrentStep('forgot-password')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
            disabled={isLoading}
          >
            Forgot your password?
          </button>
        </div>

        {/* Default Credentials Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Default Login Credentials</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Username:</strong> admin</div>
                <div><strong>Password:</strong> pass123</div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                You can change these credentials in Settings after logging in.
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={resetToLogin}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-500 text-sm">Enter your email to reset your password</p>
        </div>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Reset Instructions
            </>
          )}
        </button>
      </form>
    </>
  );

  const renderSecurityQuestionForm = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentStep('forgot-password')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Security Question</h2>
          <p className="text-slate-500 text-sm">Answer your security question to continue</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-900 font-medium">{securityQuestion}</p>
      </div>

      <form onSubmit={handleSecurityQuestion} className="space-y-6">
        <div>
          <label htmlFor="securityAnswer" className="block text-sm font-medium text-slate-700 mb-2">
            Your Answer
          </label>
          <div className="relative">
            <input
              id="securityAnswer"
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your answer"
              disabled={isLoading}
            />
            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Verify Answer
            </>
          )}
        </button>
      </form>
    </>
  );

  const renderResetPasswordForm = () => (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Lock className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create New Password</h2>
          <p className="text-slate-500 text-sm">Enter your new password</p>
        </div>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter new password"
              disabled={isLoading}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Confirm new password"
              disabled={isLoading}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Update Password
            </>
          )}
        </button>
      </form>
    </>
  );

  const renderResetSuccess = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
        <p className="text-slate-500">Your password has been updated successfully</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            You can now sign in with your new password. Please keep it secure and don't share it with anyone.
          </p>
        </div>

        <button
          onClick={resetToLogin}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5" />
          Back to Sign In
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FinanceTracker</h1>
          <p className="text-slate-600">Multi-user expense management</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {currentStep === 'login' && renderLoginForm()}
          {currentStep === 'forgot-password' && renderForgotPasswordForm()}
          {currentStep === 'security-question' && renderSecurityQuestionForm()}
          {currentStep === 'reset-password' && renderResetPasswordForm()}
          {currentStep === 'reset-success' && renderResetSuccess()}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Secure expense tracking for teams and individuals
          </p>
        </div>
      </div>
    </div>
  );
};