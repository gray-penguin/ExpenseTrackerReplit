import React from 'react';
import { Settings, Shield, Users, Briefcase, Building, MapPin, Home } from 'lucide-react';
import { getUseCaseConfig } from '../../utils/useCaseConfig';

interface GeneralTabProps {
  currentCredentials: any;
  onUpdateCredentials: (updates: any) => void;
  onUpdateUseCase: (useCase: string) => void;
  onToggleAuth: (enabled: boolean) => void;
  currentUseCase: string;
}

const useCaseOptions = [
  {
    id: 'family-expenses',
    name: 'Family Expenses',
    description: 'Track household expenses for family members',
    icon: Home,
    color: 'text-green-600'
  },
  {
    id: 'personal-team',
    name: 'Team Expenses',
    description: 'Track expenses for team members or employees',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    id: 'project-based',
    name: 'Project-Based Tracking',
    description: 'Track expenses by project or job',
    icon: Briefcase,
    color: 'text-purple-600'
  },
  {
    id: 'department-based',
    name: 'Department Tracking',
    description: 'Track expenses by department or business unit',
    icon: Building,
    color: 'text-orange-600'
  },
  {
    id: 'client-based',
    name: 'Client Account Tracking',
    description: 'Track expenses by client or customer',
    icon: Users,
    color: 'text-indigo-600'
  },
  {
    id: 'location-based',
    name: 'Location-Based Tracking',
    description: 'Track expenses by office or facility',
    icon: MapPin,
    color: 'text-teal-600'
  }
];

export const GeneralTab: React.FC<GeneralTabProps> = ({
  currentCredentials,
  onUpdateCredentials,
  onUpdateUseCase,
  onToggleAuth,
  currentUseCase
}) => {
  const currentUseCaseConfig = getUseCaseConfig(currentUseCase);

  return (
    <div className="space-y-6">
      {/* Use Case Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Application Mode</h3>
            <p className="text-slate-500">Configure how the interface is optimized for your use case</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCaseOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = currentUseCase === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => onUpdateUseCase(option.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center ${option.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {option.name}
                    </h4>
                    <p className={`text-sm ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <span className="text-sm text-emerald-800">
                <strong>Current mode:</strong> {currentUseCaseConfig.name}
              </span>
              <div className="text-xs text-emerald-700 mt-1">
                {currentUseCaseConfig.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Authentication</h3>
            <p className="text-slate-500">Control login requirements for the application</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Require Login</div>
              <div className="text-sm text-slate-600">
                {currentCredentials.authEnabled 
                  ? 'Users must sign in to access the application'
                  : 'Application is accessible without authentication'
                }
              </div>
            </div>
            <button
              onClick={() => onToggleAuth(!currentCredentials.authEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentCredentials.authEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentCredentials.authEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {currentCredentials.authEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={currentCredentials.username}
                  onChange={(e) => onUpdateCredentials({ username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={currentCredentials.password}
                  onChange={(e) => onUpdateCredentials({ password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={currentCredentials.email}
                  onChange={(e) => onUpdateCredentials({ email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Security Question</label>
                <input
                  type="text"
                  value={currentCredentials.securityQuestion}
                  onChange={(e) => onUpdateCredentials({ securityQuestion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Security Answer</label>
                <input
                  type="text"
                  value={currentCredentials.securityAnswer}
                  onChange={(e) => onUpdateCredentials({ securityAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};