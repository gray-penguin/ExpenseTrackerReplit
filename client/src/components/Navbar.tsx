import { Link, useLocation } from 'wouter';
import { BarChart3, Home, List, Tag, Users, Settings, Download, TrendingUp, LogOut } from 'lucide-react';
import { FileBackupManager } from '../utils/fileBackup';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

export function Navbar() {
  const [location] = useLocation();
  const { logout, credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

  const handleQuickBackup = () => {
    FileBackupManager.downloadBackup().catch(error => {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    });
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: List },
    { name: 'Reports', path: '/reports', icon: TrendingUp },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: useCaseConfig.userLabel, path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-16">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinanceTracker</h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-end">
            <nav className="flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.name} href={item.path}>
                    <span
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Quick Backup Button */}
            <button
              onClick={handleQuickBackup}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              title="Quick backup to download folder"
            >
              <Download className="w-4 h-4" />
              Backup
            </button>
            
            {/* Backup Warning Text */}
            <div className="text-red-600 text-xs font-medium">
              Please backup your data before exiting!
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button - TODO: implement mobile navigation */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}