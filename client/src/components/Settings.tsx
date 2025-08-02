import React, { useState } from 'react';
import { useFontSizeContext } from '../components/FontSizeProvider';
import { BackupAndRestoreTab } from './BackupAndRestoreTab';
import { getCurrentUserTimezone, getCurrentUserLocale, formatDateTime } from '../utils/formatters';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Database, Shield, Lock, User, Save, LogOut, Mail, HardDrive, Clock, Globe, Info, Users, BarChart3, Download, Briefcase, Building, Target, Layers } from 'lucide-react';

interface SettingsProps {
  onClearAllExpenses?: () => void;
  expenseCount?: number;
  onClearAllCategories?: () => void;
  categories?: any[];
  onLogout?: () => void;
  onUpdateCredentials?: (credentials: { username?: string; password?: string; email?: string }) => void;
  currentCredentials?: { username: string; password: string; email: string };
  onUpdateUseCase?: (useCase: string) => void;
  currentUseCase?: string;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onClearAllExpenses,
  expenseCount = 0,
  onClearAllCategories,
  categories = [],
  onLogout,
  onUpdateCredentials,
  currentCredentials,
  onUpdateUseCase,
  currentUseCase = 'personal-team'
}) => {
  const { getFontSizeClasses } = useFontSizeContext();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showClearCategoriesConfirmation, setShowClearCategoriesConfirmation] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'use-cases' | 'backup' | 'data' | 'about'>('general');
  const [credentialsForm, setCredentialsForm] = useState({
    username: currentCredentials?.username || '',
    password: currentCredentials?.password || '',
    email: currentCredentials?.email || '',
    confirmPassword: ''
  });
  const [credentialsError, setCredentialsError] = useState('');

  // Use case definitions
  const useCases = [
    {
      id: 'personal-team',
      name: 'Personal Team Expenses',
      description: 'Track expenses for team members, employees, or family members',
      icon: Users,
      color: 'emerald',
      examples: [
        'Company tracking employee expenses',
        'Family budget management',
        'Small business team expenses',
        'Sales team expense tracking'
      ],
      userLabel: 'Team Members',
      expenseContext: 'Track who spent what and where'
    },
    {
      id: 'project-based',
      name: 'Project-Based Tracking',
      description: 'Track expenses associated with specific projects or jobs',
      icon: Target,
      color: 'blue',
      examples: [
        'Construction project costs',
        'Client project expenses',
        'Event planning budgets',
        'Research project funding'
      ],
      userLabel: 'Projects',
      expenseContext: 'Track project costs and budget allocation'
    },
    {
      id: 'department-based',
      name: 'Department Tracking',
      description: 'Track expenses by department or business unit',
      icon: Building,
      color: 'purple',
      examples: [
        'Marketing department expenses',
        'IT infrastructure costs',
        'HR training and events',
        'Operations and facilities'
      ],
      userLabel: 'Departments',
      expenseContext: 'Track departmental spending and budgets'
    },
    {
      id: 'client-based',
      name: 'Client Account Tracking',
      description: 'Track expenses by client account or customer',
      icon: Briefcase,
      color: 'orange',
      examples: [
        'Client project billable expenses',
        'Customer account costs',
        'Service delivery expenses',
        'Account management costs'
      ],
      userLabel: 'Client Accounts',
      expenseContext: 'Track client-specific expenses for billing'
    },
    {
      id: 'location-based',
      name: 'Location-Based Tracking',
      description: 'Track expenses by office location or facility',
      icon: Layers,
      color: 'teal',
      examples: [
        'Multi-office company expenses',
        'Retail store operational costs',
        'Warehouse facility expenses',
        'Regional office budgets'
      ],
      userLabel: 'Locations',
      expenseContext: 'Track location-specific operational costs'
    }
  ];

  const selectedUseCase = useCases.find(uc => uc.id === currentUseCase) || useCases[0];

  const handleUseCaseChange = (useCaseId: string) => {
    if (onUpdateUseCase) {
      onUpdateUseCase(useCaseId);
      // Force refresh to update all UI elements with new terminology
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  const handleClearAllExpenses = () => {
    if (onClearAllExpenses) {
      onClearAllExpenses();
      setShowClearConfirmation(false);
    }
  };

  const handleClearAllCategories = () => {
    if (onClearAllCategories) {
      onClearAllCategories();
      setShowClearCategoriesConfirmation(false);
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError('');

    // Validation
    if (!credentialsForm.username.trim()) {
      setCredentialsError('Username is required');
      return;
    }

    if (credentialsForm.username.trim().length < 3) {
      setCredentialsError('Username must be at least 3 characters long');
      return;
    }

    if (!credentialsForm.email.trim()) {
      setCredentialsError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentialsForm.email.trim())) {
      setCredentialsError('Please enter a valid email address');
      return;
    }

    if (!credentialsForm.password) {
      setCredentialsError('Password is required');
      return;
    }

    if (credentialsForm.password.length < 6) {
      setCredentialsError('Password must be at least 6 characters long');
      return;
    }

    if (credentialsForm.password !== credentialsForm.confirmPassword) {
      setCredentialsError('Passwords do not match');
      return;
    }

    // Update credentials
    if (onUpdateCredentials) {
      onUpdateCredentials({
        username: credentialsForm.username.trim(),
        password: credentialsForm.password,
        email: credentialsForm.email.trim()
      });
      setShowCredentialsForm(false);
      setCredentialsForm({
        username: credentialsForm.username.trim(),
        password: credentialsForm.password,
        email: credentialsForm.email.trim(),
        confirmPassword: ''
      });
    }
  };

  const resetCredentialsForm = () => {
    setCredentialsForm({
      username: currentCredentials?.username || '',
      password: currentCredentials?.password || '',
      email: currentCredentials?.email || '',
      confirmPassword: ''
    });
    setCredentialsError('');
    setShowCredentialsForm(false);
  };

  const handleDataRestored = () => {
    // Reload the page to reflect restored data
    window.location.reload();
  };

  return (
    <div className="space-y-8">

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              General
            </div>
          </button>
          <button
            onClick={() => setActiveTab('use-cases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'use-cases'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Use Cases
            </div>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Backup & Restore
            </div>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'data'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'about'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          {/* Authentication Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Authentication & Security
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  Manage login credentials and account settings
                </p>
              </div>
            </div>

            {/* Current Credentials Display */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className={getFontSizeClasses("font-medium text-slate-900 mb-3")}>
                Current Account Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className={getFontSizeClasses("text-slate-700")}>
                    Username: <span className="font-mono bg-white px-2 py-1 rounded border">
                      {currentCredentials?.username || 'admin'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span className={getFontSizeClasses("text-slate-700")}>
                    Email: <span className="font-mono bg-white px-2 py-1 rounded border">
                      {currentCredentials?.email || 'admin@example.com'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span className={getFontSizeClasses("text-slate-700")}>
                    Password: <span className="font-mono bg-white px-2 py-1 rounded border">
                      {currentCredentials?.password || 'pass123'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials Form */}
            {showCredentialsForm ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={getFontSizeClasses("block text-sm font-medium text-slate-700 mb-2")}>
                      Username *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={credentialsForm.username}
                        onChange={(e) => setCredentialsForm(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter username"
                        required
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className={getFontSizeClasses("block text-sm font-medium text-slate-700 mb-2")}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={credentialsForm.email}
                        onChange={(e) => setCredentialsForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={getFontSizeClasses("block text-sm font-medium text-slate-700 mb-2")}>
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={credentialsForm.password}
                        onChange={(e) => setCredentialsForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className={getFontSizeClasses("block text-sm font-medium text-slate-700 mb-2")}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={credentialsForm.confirmPassword}
                        onChange={(e) => setCredentialsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {credentialsError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className={getFontSizeClasses("text-red-700 text-sm")}>{credentialsError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Update Account
                  </button>
                  <button
                    type="button"
                    onClick={resetCredentialsForm}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCredentialsForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Update Account
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className={getFontSizeClasses("font-medium text-amber-900")}>
                    Security Information
                  </h4>
                  <ul className={getFontSizeClasses("text-amber-800 mt-1 space-y-1")}>
                    <li>• Your email is used for account identification</li>
                    <li>• Changing credentials will require you to sign in again</li>
                    <li>• Keep your login information secure and private</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Time & Locale Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Time & Region
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  Your current time and locale settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className={getFontSizeClasses("font-medium text-slate-900")}>
                        Current Time
                      </div>
                      <div className={getFontSizeClasses("text-slate-500")}>
                        {formatDateTime(new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className={getFontSizeClasses("font-medium text-slate-900")}>
                        Timezone
                      </div>
                      <div className={getFontSizeClasses("text-slate-500")}>
                        {getCurrentUserTimezone()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className={getFontSizeClasses("font-medium text-slate-900")}>
                        Language & Region
                      </div>
                      <div className={getFontSizeClasses("text-slate-500")}>
                        {getCurrentUserLocale()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">i</span>
                </div>
                <div>
                  <h4 className={getFontSizeClasses("font-medium text-blue-900")}>
                    Automatic Detection
                  </h4>
                  <p className={getFontSizeClasses("text-blue-800 mt-1")}>
                    Time and date formats are automatically detected from your browser settings. 
                    All timestamps and relative times are displayed in your local timezone.
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
      )}

      {activeTab === 'use-cases' && (
        <div className="space-y-6">
          {/* Current Use Case Display */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 bg-${selectedUseCase.color}-100 rounded-xl flex items-center justify-center`}>
                <selectedUseCase.icon className={`w-5 h-5 text-${selectedUseCase.color}-600`} />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Current Use Case
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  How your expense tracker is currently configured
                </p>
              </div>
            </div>

            <div className={`p-4 bg-${selectedUseCase.color}-50 border border-${selectedUseCase.color}-200 rounded-lg`}>
              <div className="flex items-start gap-3">
                <selectedUseCase.icon className={`w-6 h-6 text-${selectedUseCase.color}-600 mt-0.5`} />
                <div>
                  <h4 className={getFontSizeClasses(`font-semibold text-${selectedUseCase.color}-900`)}>
                    {selectedUseCase.name}
                  </h4>
                  <p className={getFontSizeClasses(`text-${selectedUseCase.color}-700 mt-1`)}>
                    {selectedUseCase.description}
                  </p>
                  <div className={getFontSizeClasses(`text-sm text-${selectedUseCase.color}-600 mt-2`)}>
                    <strong>User Label:</strong> {selectedUseCase.userLabel} • <strong>Context:</strong> {selectedUseCase.expenseContext}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Case Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Choose Your Use Case
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  Select the tracking scenario that best fits your needs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {useCases.map((useCase) => {
                const isSelected = currentUseCase === useCase.id;
                const IconComponent = useCase.icon;
                
                return (
                  <button
                    key={useCase.id}
                    onClick={() => handleUseCaseChange(useCase.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? `border-${useCase.color}-500 bg-${useCase.color}-50 shadow-sm`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        isSelected 
                          ? `bg-${useCase.color}-100` 
                          : 'bg-slate-100'
                      } flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${
                          isSelected 
                            ? `text-${useCase.color}-600` 
                            : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={getFontSizeClasses(`font-semibold ${
                          isSelected 
                            ? `text-${useCase.color}-900` 
                            : 'text-slate-900'
                        }`)}>
                          {useCase.name}
                        </h4>
                        <p className={getFontSizeClasses(`text-sm ${
                          isSelected 
                            ? `text-${useCase.color}-700` 
                            : 'text-slate-600'
                        } mt-1`)}>
                          {useCase.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className={`w-6 h-6 bg-${useCase.color}-500 rounded-full flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className={getFontSizeClasses(`text-xs font-medium ${
                        isSelected 
                          ? `text-${useCase.color}-800` 
                          : 'text-slate-700'
                      } uppercase tracking-wide`)}>
                        Example Use Cases:
                      </div>
                      <ul className="space-y-1">
                        {useCase.examples.map((example, index) => (
                          <li key={index} className={getFontSizeClasses(`text-xs ${
                            isSelected 
                              ? `text-${useCase.color}-600` 
                              : 'text-slate-500'
                          } flex items-center gap-2`)}>
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`mt-3 pt-3 border-t ${
                      isSelected 
                        ? `border-${useCase.color}-200` 
                        : 'border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={getFontSizeClasses(`text-xs ${
                          isSelected 
                            ? `text-${useCase.color}-700` 
                            : 'text-slate-600'
                        }`)}>
                          <strong>Users become:</strong> {useCase.userLabel}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Impact Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className={getFontSizeClasses("font-medium text-amber-900")}>
                    Use Case Impact
                  </h4>
                  <ul className={getFontSizeClasses("text-amber-800 mt-1 space-y-1")}>
                    <li>• Changing use cases updates terminology throughout the app</li>
                    <li>• Your existing data remains unchanged and fully compatible</li>
                    <li>• User interface labels will reflect the selected use case</li>
                    <li>• All functionality remains the same, only presentation changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <BackupAndRestoreTab onDataRestored={handleDataRestored} />
      )}

      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Data Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Data Management
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  delete all data from your account
                </p>
              </div>
            </div>

            {/* Clear All Expenses */}
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className={getFontSizeClasses("font-semibold text-red-900 mb-1")}>
                      Clear All Expenses
                    </h4>
                    <p className={getFontSizeClasses("text-red-700 mb-3")}>
                      Permanently delete all expense records from your account. This action cannot be undone.
                    </p>
                    <div className={getFontSizeClasses("text-sm text-red-600 mb-4")}>
                      Current expenses: <span className="font-semibold">{expenseCount}</span>
                    </div>
                    <button
                      onClick={() => setShowClearConfirmation(true)}
                      disabled={expenseCount === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Expenses
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear All Categories - Only show when no expenses exist */}
            {expenseCount === 0 && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50 mt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className={getFontSizeClasses("font-semibold text-red-900 mb-1")}>
                        Clear All Categories
                      </h4>
                      <p className={getFontSizeClasses("text-red-700 mb-3")}>
                        Permanently delete all categories and subcategories. This will also remove all associated expenses.
                      </p>
                      <div className={getFontSizeClasses("text-sm text-red-600 mb-4")}>
                        Current categories: <span className="font-semibold">{categories?.length || 0}</span>
                      </div>
                      <button
                        onClick={() => setShowClearCategoriesConfirmation(true)}
                        disabled={(categories?.length || 0) === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Categories
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Note */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className={getFontSizeClasses("font-medium text-amber-900")}>
                    Data Safety Reminder
                  </h4>
                  <p className={getFontSizeClasses("text-amber-800 mt-1")}>
                    This action will permanently delete all your expense data and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                  <p className="text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to delete all <span className="font-semibold">{expenseCount}</span> expenses? 
                  This will permanently remove all expense records, including:
                </p>
                <ul className="text-sm text-slate-600 space-y-1 ml-4">
                  <li>• All expense transactions</li>
                  <li>• Associated notes and descriptions</li>
                  <li>• Uploaded receipts and attachments</li>
                  <li>• Store and location information</li>
                </ul>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> This action cannot be reversed once completed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirmation(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllExpenses}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete All Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Categories Confirmation Modal */}
      {showClearCategoriesConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Confirm Category Deletion</h3>
                  <p className="text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to delete all <span className="font-semibold">{categories.length}</span> categories? 
                  This will permanently remove:
                </p>
                <ul className="text-sm text-slate-600 space-y-1 ml-4">
                  <li>• All categories and subcategories</li>
                  <li>• All expenses associated with these categories</li>
                  <li>• Category icons and color settings</li>
                  <li>• User default category preferences</li>
                </ul>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> This will also delete all expenses since they require categories.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearCategoriesConfirmation(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllCategories}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete All Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">What is Expense Tracker?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A comprehensive expense tracking Progressive Web Application that helps you log, categorize, and analyze your spending. Being a PWA allows you to install this application on your device and use it completely offline. No internet needed after installation!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Configurable Use Cases</h4>
                    <p className="text-gray-600 text-xs">Adapt the interface for different scenarios: team expenses, project tracking, department budgets, client accounts, or location-based tracking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Advanced Analytics</h4>
                    <p className="text-gray-600 text-xs">Comprehensive reporting with spreadsheet-style analytics and trends</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Local Storage</h4>
                    <p className="text-gray-600 text-xs">Data stored locally using IndexedDB for complete privacy and offline functionality.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Backup & Restore</h4>
                    <p className="text-gray-600 text-xs">Complete JSON backup/restore system for all your data including expenses, categories, and users</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technical Architecture</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frontend:</span>
                    <span className="font-medium text-gray-900">React + TypeScript + Tailwind CSS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Architecture:</span>
                    <span className="font-medium text-gray-900">Single Page Application (SPA)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Router:</span>
                    <span className="font-medium text-gray-900">Wouter (lightweight routing)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">State:</span>
                    <span className="font-medium text-gray-900">React Hooks + IndexedDB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage:</span>
                    <span className="font-medium text-gray-900">IndexedDB (Local Device)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Dashboard with real-time statistics and spending trends</li>
                  <li>• Hierarchical category system with subcategories</li>
                  <li>• Bulk expense entry with intelligent form suggestions</li>
                  <li>• Advanced filtering by user, date range, and categories</li>
                  <li>• Comprehensive reports with spreadsheet-style analytics</li>
                  <li>• User authentication with password reset functionality</li>
                  <li>• Configurable use cases for different tracking scenarios</li>
                  <li>• Complete JSON backup and restore system</li>
                  <li>• Progressive Web App with offline functionality</li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-emerald-900 text-sm">Privacy & Security</h4>
                    <p className="text-emerald-700 text-xs leading-relaxed">
                      All data is stored locally in your browser using IndexedDB. No information is sent to external servers, 
                      ensuring complete privacy and control over your financial data. Works completely offline after initial load.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};