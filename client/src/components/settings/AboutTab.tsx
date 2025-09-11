import React from 'react';
import { VersionDisplay } from '../VersionDisplay';
import { InstallationCodeManager } from '../../utils/installationCode';
import { usePWADetection } from '../../hooks/usePWADetection';
import { Info, Smartphone, Shield, Database, Download, Upload, Users, BarChart3, Copy, CheckCircle, Globe, Code, Layers, Zap } from 'lucide-react';

export const AboutTab: React.FC = () => {
  const pwaStatus = usePWADetection();
  const [installationCode, setInstallationCode] = React.useState<string>('');
  const [codeCopied, setCodeCopied] = React.useState(false);

  React.useEffect(() => {
    InstallationCodeManager.getInstallationCode().then(code => {
      setInstallationCode(code);
    });
  }, []);

  const handleCopyCode = async () => {
    const success = await InstallationCodeManager.copyToClipboard(installationCode);
    if (success) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Multi-User Support',
      description: 'Track expenses for multiple users with individual profiles and preferences',
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting with charts, trends, and detailed breakdowns',
      color: 'text-purple-600'
    },
    {
      icon: Database,
      title: 'Local Storage',
      description: 'All data stored locally on your device using IndexedDB for privacy',
      color: 'text-green-600'
    },
    {
      icon: Download,
      title: 'Import & Export',
      description: 'CSV import/export and JSON backup/restore capabilities',
      color: 'text-orange-600'
    }
  ];

  const techStack = [
    { name: 'React 18', description: 'Modern UI framework with hooks and concurrent features' },
    { name: 'TypeScript', description: 'Type-safe development with enhanced IDE support' },
    { name: 'Wouter', description: 'Lightweight client-side routing for single-page navigation' },
    { name: 'Express.js', description: 'Backend API server for data management' },
    { name: 'IndexedDB', description: 'Browser-native database for offline data storage' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for responsive design' }
  ];

  return (
    <div className="space-y-6">
      {/* App Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">About ExpenseTracker</h3>
            <p className="text-slate-500">Multi-user expense tracking application with advanced analytics</p>
          </div>
        </div>

        <div className="prose prose-sm text-slate-600 max-w-none">
          <p>
            ExpenseTracker is a comprehensive expense management application designed for teams, families, 
            and individuals who need to track spending across multiple users and categories. Built with 
            privacy in mind, all data is stored locally on your device.
          </p>
          
          <p>
            Originally developed in Bolt and successfully migrated to Replit's full-stack JavaScript 
            template, the application maintains all its sophisticated features while providing a 
            robust foundation for future enhancements.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Key Features
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center ${feature.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-medium text-slate-900">{feature.title}</h5>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          Technical Stack
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techStack.map((tech, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <div>
                <div className="font-medium text-slate-900 text-sm">{tech.name}</div>
                <div className="text-xs text-slate-600">{tech.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Privacy & Security
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Database className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-green-900">Local Data Storage</h5>
              <p className="text-sm text-green-800">
                All your expense data is stored locally in your browser using IndexedDB. 
                No data is sent to external servers or third parties.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900">Progressive Web App</h5>
              <p className="text-sm text-blue-800">
                Install as a native app on your device for offline access and better performance. 
                Status: <span className={`font-medium ${pwaStatus.getStatusColor()}`}>{pwaStatus.getStatusText()}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-purple-900">Offline Functionality</h5>
              <p className="text-sm text-purple-800">
                Works completely offline after initial load. No internet connection required for daily use.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Code */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          Installation Information
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Installation Code</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={installationCode}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={handleCopyCode}
                className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                  codeCopied
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                }`}
              >
                {codeCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 inline mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unique identifier for this installation. Useful for support and data recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Version Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <VersionDisplay showHistory={true} />
      </div>

      {/* Migration History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4">Migration History</h4>
          
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="font-medium text-blue-900">Browser State Implementation</span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-sm text-blue-800">
            Implemented sophisticated browser state management using IndexedDB for 
            complete offline functionality and data persistence.
          </p>
        </div>
      </div>
    </div>
  );
};