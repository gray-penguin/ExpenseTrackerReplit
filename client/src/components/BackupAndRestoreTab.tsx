import React, { useState } from 'react';
import { FileBackupManager } from '../utils/fileBackup';
import { Download, Upload, Save, RotateCcw, AlertCircle, CheckCircle, FileText, FolderOpen, FilePlus, Edit3, Folder, File } from 'lucide-react';

interface BackupAndRestoreTabProps {
  onDataRestored?: () => void;
}

export const BackupAndRestoreTab: React.FC<BackupAndRestoreTabProps> = ({ onDataRestored }) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDirectorySettings, setShowDirectorySettings] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState(() => {
    return localStorage.getItem('expense-tracker-backup-directory') || 'Downloads';
  });
  const [defaultFilename, setDefaultFilename] = useState(() => {
    return localStorage.getItem('expense-tracker-backup-filename') || 'expense-tracker-backup-{date}.json';
  });
  const [editingDirectory, setEditingDirectory] = useState(false);
  const [editingFilename, setEditingFilename] = useState(false);
  const [tempDirectory, setTempDirectory] = useState(currentDirectory);
  const [tempFilename, setTempFilename] = useState(defaultFilename);

  // Save settings to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('expense-tracker-backup-directory', currentDirectory);
  }, [currentDirectory]);

  React.useEffect(() => {
    localStorage.setItem('expense-tracker-backup-filename', defaultFilename);
  }, [defaultFilename]);

  const handleSaveDirectory = () => {
    setCurrentDirectory(tempDirectory);
    setEditingDirectory(false);
  };

  const handleCancelDirectoryEdit = () => {
    setTempDirectory(currentDirectory);
    setEditingDirectory(false);
  };

  const handleSaveFilename = () => {
    setDefaultFilename(tempFilename);
    setEditingFilename(false);
  };

  const handleCancelFilenameEdit = () => {
    setTempFilename(defaultFilename);
    setEditingFilename(false);
  };

  const getFormattedFilename = () => {
    const today = new Date().toISOString().split('T')[0];
    return defaultFilename.replace('{date}', today);
  };

  const handleDownloadBackup = () => {
    const filename = getFormattedFilename();
    // Direct download without async/await to ensure proper user interaction
    FileBackupManager.downloadBackup(filename).catch(error => {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    });
  };

  const handleDownloadBackupWithPrompt = async () => {
    FileBackupManager.downloadBackupWithPrompt().catch(error => {
      console.error('Backup with prompt failed:', error);
      alert('Backup failed. Please try again.');
    });
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreMessage(null);

    try {
      const result = await FileBackupManager.restoreFromFile(file);
      setRestoreMessage({
        type: result.success ? 'success' : 'error',
        message: result.message
      });

      if (result.success && onDataRestored) {
        onDataRestored();
      }
    } catch (error) {
      setRestoreMessage({
        type: 'error',
        message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRestoring(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Backup & Restore</h3>
        <p className="text-slate-600 text-sm mb-6">
          Create backups of your data to save locally on your computer, or restore from previous backups.
        </p>
      </div>

      {/* Current Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-900 flex items-center gap-2">
            <File className="w-5 h-5 text-blue-600" />
            Current Backup Settings
          </h4>
          <button
            onClick={() => setShowDirectorySettings(!showDirectorySettings)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {showDirectorySettings ? 'Hide Settings' : 'Edit Settings'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Directory Setting */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Directory</label>
            {editingDirectory ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tempDirectory}
                    onChange={(e) => setTempDirectory(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Downloads, Documents/Backups"
                  />
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button
                  onClick={handleSaveDirectory}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelDirectoryEdit}
                  className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-900 font-mono">{currentDirectory}</span>
                </div>
                {showDirectorySettings && (
                  <button
                    onClick={() => {
                      setTempDirectory(currentDirectory);
                      setEditingDirectory(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filename Setting */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Filename Pattern</label>
            {editingFilename ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tempFilename}
                      onChange={(e) => setTempFilename(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., expense-tracker-backup-{date}.json"
                    />
                    <File className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    onClick={handleSaveFilename}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelFilenameEdit}
                    className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Use {'{date}'} to automatically insert today's date (YYYY-MM-DD)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-900 font-mono">{defaultFilename}</span>
                  </div>
                  {showDirectorySettings && (
                    <button
                      onClick={() => {
                        setTempFilename(defaultFilename);
                        setEditingFilename(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <div>
                      <span className="text-sm text-blue-800">
                        <strong>Preview:</strong> {getFormattedFilename()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Path Preview */}
          {!editingDirectory && !editingFilename && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-emerald-900">Full backup path:</div>
                  <div className="text-sm text-emerald-800 font-mono">
                    {currentDirectory}/{getFormattedFilename()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Backup Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-blue-600" />
          Manual Backup
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left w-full"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Quick Backup</div>
              <div className="text-sm text-slate-500">Download a JSON backup file to save your data</div>
            </div>
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-orange-600" />
          Restore from Backup
        </h4>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              disabled={isRestoring}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="backup-restore"
            />
            <label
              htmlFor="backup-restore"
              className={`flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left w-full ${
                isRestoring
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }`}
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {isRestoring ? 'Restoring...' : 'Select Backup File'}
                </div>
                <div className="text-sm text-slate-500">
                  Choose a JSON backup file to restore your data
                </div>
              </div>
            </label>
          </div>

          {restoreMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              restoreMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {restoreMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                restoreMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {restoreMessage.message}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">Important Notes</h4>
            <ul className="text-sm text-amber-800 mt-1 space-y-1">
              <li>• Smart Backup lets you choose filename and remembers locations</li>
              <li>• Backup files are saved to your configured directory (currently: {currentDirectory})</li>
              <li>• Restoring will replace all current data</li>
              <li>• Create blank backups to set up new backup files</li>
              <li>• Regular manual backups are recommended for safety</li>
              <li>• Use {'{date}'} in filename to automatically include current date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};