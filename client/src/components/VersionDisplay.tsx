import React from 'react';
import { APP_VERSION, VERSION_HISTORY, formatVersion } from '../utils/version';
import { Tag, Calendar, GitBranch, Info } from 'lucide-react';

interface VersionDisplayProps {
  showHistory?: boolean;
  compact?: boolean;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ 
  showHistory = false, 
  compact = false 
}) => {
  const currentVersion = VERSION_HISTORY[0];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Tag className="w-4 h-4" />
        <span className="font-medium">{formatVersion(APP_VERSION)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Version */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Tag className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">Current Version</h4>
            <p className="text-emerald-700 text-sm">{formatVersion(APP_VERSION)} • Released {currentVersion.date}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h5 className="font-medium text-emerald-800 text-sm">Latest Changes:</h5>
          <ul className="text-sm text-emerald-700 space-y-1">
            {currentVersion.changes.map((change, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Version History */}
      {showHistory && VERSION_HISTORY.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-slate-600" />
            <h4 className="font-semibold text-slate-900">Version History</h4>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {VERSION_HISTORY.slice(1).map((version, index) => (
              <div key={version.version} className="border-l-2 border-slate-200 pl-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-slate-900">{formatVersion(version.version)}</span>
                  <span className="text-slate-500 text-sm">•</span>
                  <span className="text-slate-500 text-sm">{version.date}</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  {version.changes.slice(0, 3).map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                  {version.changes.length > 3 && (
                    <li className="text-slate-500 text-xs ml-3">
                      ... and {version.changes.length - 3} more changes
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};