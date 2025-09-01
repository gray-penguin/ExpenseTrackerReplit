import React, { useState } from 'react';
import { Category } from '../types';
import { AboutTab } from './settings/AboutTab';
import { GeneralTab } from './settings/GeneralTab';
import { BackupAndRestoreTab } from './BackupAndRestoreTab';
import { DataManagementTab } from './settings/DataManagementTab';
import { ExcelConversionTab } from './ExcelConversionTab';
import { Info, Settings as SettingsIcon, RotateCcw, Trash2, FileSpreadsheet } from 'lucide-react';

interface SettingsProps {
  onClearAllExpenses: () => void;
  expenseCount: number;
  onClearAllCategories: () => void;
  categories: Category[];
  onLogout: () => void;
  onUpdateCredentials: (updates: any) => void;
  currentCredentials: any;
  onUpdateUseCase: (useCase: string) => void;
  onToggleAuth: (enabled: boolean) => void;
  currentUseCase: string;
}

export const Settings: React.FC<SettingsProps> = ({
  onClearAllExpenses,
  expenseCount,
  onClearAllCategories,
  categories,
  onLogout,
  onUpdateCredentials,
  currentCredentials,
  onUpdateUseCase,
  onToggleAuth,
  currentUseCase
}) => {
  const [activeTab, setActiveTab] = useState('about');

  const tabs = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'backup', label: 'Backup & Restore', icon: RotateCcw },
    { id: 'excel', label: 'Excel Conversion', icon: FileSpreadsheet },
    { id: 'data', label: 'Data Management', icon: Trash2 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab />;
      case 'general':
        return (
          <GeneralTab
            currentCredentials={currentCredentials}
            onUpdateCredentials={onUpdateCredentials}
            onUpdateUseCase={onUpdateUseCase}
            onToggleAuth={onToggleAuth}
            currentUseCase={currentUseCase}
          />
        );
      case 'backup':
        return <BackupAndRestoreTab />;
      case 'excel':
        return <ExcelConversionTab />;
      case 'data':
        return (
          <DataManagementTab
            onClearAllExpenses={onClearAllExpenses}
            expenseCount={expenseCount}
            onClearAllCategories={onClearAllCategories}
            categories={categories}
            onLogout={onLogout}
          />
        );
      default:
        return <AboutTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};