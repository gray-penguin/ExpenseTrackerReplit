import React, { useState, useEffect } from 'react';
import { useFontSizeContext } from '../components/FontSizeProvider';
import { BackupAndRestoreTab } from './BackupAndRestoreTab';
import { getCurrentUserTimezone, getCurrentUserLocale, formatDateTime } from '../utils/formatters';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Database, Shield, Lock, User, Save, LogOut, Mail, HardDrive, Clock, Globe, Info, Users, BarChart3, Download, Briefcase, Building, Target, Layers, FileSpreadsheet, Copy, RotateCcw, Smartphone, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { FileText } from 'lucide-react';
import { ExcelConversionTab } from './ExcelConversionTab.tsx';
import { InstallationCodeManager } from '../utils/installationCode';
import { VersionDisplay, APP_VERSION } from './VersionDisplay';
import { APP_VERSION as VERSION_CONSTANT, formatVersion } from '../utils/version';

interface SettingsProps {
  onClearAllExpenses?: () => void;
  expenseCount?: number;
  onClearAllCategories?: () => void;
  categories?: any[];
  onLogout?: () => void;
  onUpdateCredentials?: (credentials: { username?: string; password?: string; email?: string }) => void;
  currentCredentials?: { username: string; password: string; email: string };
  onUpdateUseCase?: (useCase: string) => void;
  onToggleAuth?: (enabled: boolean) => void;
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
  onToggleAuth,
  currentUseCase = 'family-expenses'
}) => {
  const { getFontSizeClasses } = useFontSizeContext();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showClearCategoriesConfirmation, setShowClearCategoriesConfirmation] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'auth' | 'use-cases' | 'backup' | 'excel' | 'data' | 'about'>('general');
  const [credentialsForm, setCredentialsForm] = useState({
    username: currentCredentials?.username || '',
    password: currentCredentials?.password || '',
    email: currentCredentials?.email || '',
    confirmPassword: ''
  });
  const [credentialsError, setCredentialsError] = useState('');
  // Load installation info on component mount
  useEffect(() => {
    const loadInstallationInfo = async () => {
      try {
        const info = await InstallationCodeManager.getInstallationInfo();
        setInstallationInfo(info);
      } catch (error) {
        console.error('Error loading installation info:', error);
      }
    };

    if (activeTab === 'general') {
      loadInstallationInfo();
    }
  }, [activeTab]);

  const handleCopyInstallationCode = async () => {
    if (!installationInfo) return;
    
    const success = await InstallationCodeManager.copyToClipboard(installationInfo.code);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      alert('Failed to copy to clipboard');
    }
  };

  const handleResetInstallationCode = async () => {
    if (confirm('Are you sure you want to generate a new installation code? This will replace your current code.')) {
      try {
        const newCode = await InstallationCodeManager.resetInstallationCode();
        const newInfo = await InstallationCodeManager.getInstallationInfo();
        setInstallationInfo(newInfo);
      } catch (error) {
        console.error('Error resetting installation code:', error);
        alert('Failed to generate new installation code');
      }
    }
  };

  const [installationInfo, setInstallationInfo] = useState<{
    code: string;
    generatedAt: string;
    deviceInfo: any;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Use case definitions
  const useCases = [
    {
      id: 'family-expenses',
      name: 'Family Expenses',
      description: 'Track household expenses for family members with shared budgets and responsibilities',
      icon: Users,
      color: 'emerald',
      examples: [
        'Household budget management',
        'Family member expense tracking',
        'Shared family expenses',
        'Kids allowance and spending'
      ],
      userLabel: 'Family Members',
      expenseContext: 'Track who spent what on family needs and activities'
    },
    {
      id: 'personal-team',
      name: 'Team Expenses',
      description: 'Track expenses for team members or employees',
      icon: Users,
      color: 'emerald',
      examples: [
        'Employee expense tracking',
        'Company team expenses',
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
    console.log('Settings: handleUseCaseChange called with:', useCaseId);
    if (onUpdateUseCase) {
      console.log('Settings: Calling onUpdateUseCase with:', useCaseId);
      onUpdateUseCase(useCaseId);
    } else {
      console.log('Settings: onUpdateUseCase is not provided');
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
    // Data will be automatically updated through the hooks
    window.location.reload();
  };

  const copyInstallationCode = async (code: string) => {
    const success = await InstallationCodeManager.copyToClipboard(code);
    if (success) {
      alert('Installation code copied to clipboard!');
    } else {
      alert('Failed to copy installation code');
    }
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
            onClick={() => setActiveTab('auth')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'auth'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Authentication
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
            onClick={() => setActiveTab('excel')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'excel'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Import Expenses
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
              Delete Data
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
          {/* Installation Code */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className={getFontSizeClasses("text-lg font-semibold text-slate-900")}>
                  Installation Code
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  Unique identifier for this PWA installation
                </p>
              </div>
            </div>

            {installationInfo ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className={getFontSizeClasses("font-medium text-purple-900")}>
                        Your Installation Code
                      </div>
                      <div className={getFontSizeClasses("text-purple-700 text-sm")}>
                        Generated: {new Date(installationInfo.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyInstallationCode}
                        className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                          copySuccess 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                        }`}
                        title="Copy installation code"
                      >
                        <Copy className="w-3 h-3" />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="font-mono text-lg font-bold text-purple-900 bg-white px-4 py-3 rounded border border-purple-300 text-center tracking-wider">
                    {installationInfo.code}
                  </div>
                </div>

                {/* Device Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-slate-600" />
                      <span className={getFontSizeClasses("font-medium text-slate-900")}>Device Info</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div><strong>Platform:</strong> {installationInfo.deviceInfo.platform}</div>
                      <div><strong>Language:</strong> {installationInfo.deviceInfo.language}</div>
                      <div><strong>Timezone:</strong> {installationInfo.deviceInfo.timezone}</div>
                      <div><strong>Screen:</strong> {installationInfo.deviceInfo.screenResolution}</div>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-slate-600" />
                      <span className={getFontSizeClasses("font-medium text-slate-900")}>Installation</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div><strong>App:</strong> ExpenseTracker PWA</div>
                      <div><strong>Version:</strong> {formatVersion(VERSION_CONSTANT)}</div>
                      <div><strong>Type:</strong> Progressive Web App</div>
                      <div><strong>Storage:</strong> IndexedDB Local</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <div>
                      <h4 className={getFontSizeClasses("font-medium text-blue-900")}>
                        About Installation Codes
                      </h4>
                      <p className={getFontSizeClasses("text-blue-800 mt-1")}>
                        This unique code identifies your specific PWA installation. It's useful for support, 
                        analytics, and distinguishing between multiple installations. The code is stored locally 
                        and included in backup files for restoration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-600">Loading installation code...</span>
              </div>
            )}
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

      {activeTab === 'auth' && (
        <div className="space-y-6">
          {/* Authentication Toggle */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Login Protection</h3>
                  <p className="text-slate-500">Control whether users need to log in to access the app</p>
                </div>
              </div>
              <button
                onClick={() => onToggleAuth && onToggleAuth(!currentCredentials?.authEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentCredentials?.authEnabled
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {currentCredentials?.authEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Disabled
                  </>
                )}
              </button>
            </div>

            <div className={`p-4 rounded-lg border ${
              currentCredentials?.authEnabled
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  currentCredentials?.authEnabled
                    ? 'bg-emerald-100'
                    : 'bg-amber-100'
                }`}>
                  <span className={`text-xs font-bold ${
                    currentCredentials?.authEnabled
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}>
                    {currentCredentials?.authEnabled ? '🔒' : '🔓'}
                  </span>
                </div>
                <div>
                  <h4 className={`font-medium mb-1 ${
                    currentCredentials?.authEnabled
                      ? 'text-emerald-900'
                      : 'text-amber-900'
                  }`}>
                    {currentCredentials?.authEnabled ? 'Login Required' : 'Open Access'}
                  </h4>
                  <p className={`text-sm ${
                    currentCredentials?.authEnabled
                      ? 'text-emerald-800'
                      : 'text-amber-800'
                  }`}>
                    {currentCredentials?.authEnabled
                      ? 'Users must enter valid credentials to access the expense tracker. This provides security for your financial data.'
                      : 'Anyone can access the expense tracker without logging in. This is convenient for personal use or trusted environments.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Credentials (only show when auth is enabled) */}
          {currentCredentials?.authEnabled && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Login Credentials</h3>
                  <p className="text-slate-500">Manage the username and password for accessing the app</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={currentCredentials?.username || ''}
                    onChange={(e) => onUpdateCredentials && onUpdateCredentials({ username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={currentCredentials?.password || ''}
                    onChange={(e) => onUpdateCredentials && onUpdateCredentials({ password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={currentCredentials?.email || ''}
                    onChange={(e) => onUpdateCredentials && onUpdateCredentials({ email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Security Question</label>
                  <input
                    type="text"
                    value={currentCredentials?.securityQuestion || ''}
                    onChange={(e) => onUpdateCredentials && onUpdateCredentials({ securityQuestion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter security question"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Security Answer</label>
                <input
                  type="text"
                  value={currentCredentials?.securityAnswer || ''}
                  onChange={(e) => onUpdateCredentials && onUpdateCredentials({ securityAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter security answer"
                />
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Note:</strong> Changes to login credentials take effect immediately. 
                    Make sure to remember your new credentials before logging out.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Security Information</h3>
                <p className="text-slate-500">Understanding authentication options</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-emerald-900">Authentication Enabled</span>
                  </div>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li>• Requires login to access the app</li>
                    <li>• Protects your financial data</li>
                    <li>• Includes password reset functionality</li>
                    <li>• Recommended for shared devices</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-900">Authentication Disabled</span>
                  </div>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Direct access to the app</li>
                    <li>• No login screen or passwords</li>
                    <li>• Faster access for personal use</li>
                    <li>• Best for private/trusted devices</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <strong>Data Security:</strong> Regardless of authentication settings, all your expense data 
                    is stored locally on your device using IndexedDB. No data is sent to external servers, 
                    ensuring complete privacy and offline functionality.
                  </div>
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

      {activeTab === 'excel' && (
        <ExcelConversionTab />
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
                  Delete Data
                </h3>
                <p className={getFontSizeClasses("text-slate-500")}>
                  Permanently delete all data from your account
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
                        disabled={categories?.length === 0}
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
          <div className="space-y-6">
            {/* About This App */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">About This App</h3>
                    <p className="text-slate-500">ExpenseTracker overview and technical details</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">v{VERSION_CONSTANT}</div>
                  <div className="text-xs text-slate-500">Current Version</div>
                </div>
              </div>

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

                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Excel Import & Conversion</h4>
                      <p className="text-gray-600 text-xs">Direct Excel file import with automatic parsing and JSON conversion for seamless data migration</p>
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
                    <li>• Excel to JSON conversion with automatic data validation and conversion</li>
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

            {/* Version Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Version Information</h3>
                  <p className="text-slate-500">Current version and recent updates</p>
                </div>
              </div>
              
              <VersionDisplay showHistory={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};