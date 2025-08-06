import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { Dashboard } from './pages/Dashboard';
import { ExpensesList } from './pages/ExpensesList';
import { ReportsPage } from './pages/ReportsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { FontSizeProvider } from './components/FontSizeProvider';
import { useAuth } from './hooks/useAuth';
import { useExpenseData } from './hooks/useExpenseData';

function App() {
  const { 
    isAuthenticated, 
    isLoading: authLoading,
    credentials, 
    login, 
    sendPasswordResetEmail, 
    verifySecurityAnswer, 
    resetPassword 
  } = useAuth();
  const { isLoading: dataLoading } = useExpenseData();

  // Show loading state while initializing
  if (authLoading || dataLoading) {
    return (
      <div>Loading...</div>
    );
  }
  
  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <FontSizeProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Expense Tracker</h1>
                <p className="text-slate-500 text-sm">Manage your finances with ease</p>
              </div>
            </div>
            <LoginPage
              onLogin={login}
              onSendPasswordReset={sendPasswordResetEmail}
              onVerifySecurityAnswer={verifySecurityAnswer}
              onResetPassword={resetPassword}
              userEmail={credentials.email}
              securityQuestion={credentials.securityQuestion}
            />
          </div>
        </div>
      </FontSizeProvider>
    );
  }
  

  // Show main app if authenticated
  return (
    <FontSizeProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/expenses" component={ExpensesList} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/categories" component={CategoriesPage} />
            <Route path="/users" component={UsersPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route>
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
                <p className="text-gray-500 mt-2">The page you are looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </FontSizeProvider>
  );
}

export default App;