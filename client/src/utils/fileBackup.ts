export interface BackupData {
  version: string;
  timestamp: string;
  users: any[];
  categories: any[];
  subcategories: any[];
  expenses: any[];
  credentials: any;
  settings: any;
  useCase: string;
}

export interface BackupLocation {
  path: string;
  name: string;
  lastUsed: string;
}

import { indexedDBStorage } from './indexedDBStorage';

export class FileBackupManager {
  private static readonly BACKUP_VERSION = '1.0.0';
  private static readonly BACKUP_LOCATIONS_KEY = 'expense-tracker-backup-locations';
  private static readonly DEFAULT_BACKUP_LOCATION_KEY = 'expense-tracker-default-backup-location';

  /**
   * Get saved backup locations
   */
  static getBackupLocations(): BackupLocation[] {
    try {
      const locations = localStorage.getItem(this.BACKUP_LOCATIONS_KEY);
      return locations ? JSON.parse(locations) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save backup location
   */
  static saveBackupLocation(location: BackupLocation): void {
    try {
      const locations = this.getBackupLocations();
      const existingIndex = locations.findIndex(loc => loc.path === location.path);
      
      if (existingIndex >= 0) {
        locations[existingIndex] = location;
      } else {
        locations.push(location);
      }
      
      // Keep only last 10 locations
      const recentLocations = locations
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 10);
      
      localStorage.setItem(this.BACKUP_LOCATIONS_KEY, JSON.stringify(recentLocations));
    } catch (error) {
      console.error('Failed to save backup location:', error);
    }
  }

  /**
   * Get default backup location
   */
  static getDefaultBackupLocation(): string | null {
    try {
      return localStorage.getItem(this.DEFAULT_BACKUP_LOCATION_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Set default backup location
   */
  static setDefaultBackupLocation(path: string): void {
    try {
      localStorage.setItem(this.DEFAULT_BACKUP_LOCATION_KEY, path);
    } catch (error) {
      console.error('Failed to set default backup location:', error);
    }
  }

  /**
   * Prompt user for backup location and filename
   */
  static async promptForBackupLocation(): Promise<{ filename: string; location?: BackupLocation } | null> {
    return new Promise((resolve) => {
      const modal = this.createBackupLocationModal(resolve);
      document.body.appendChild(modal);
    });
  }

  /**
   * Create backup location selection modal
   */
  private static createBackupLocationModal(
    onComplete: (result: { filename: string; location?: BackupLocation } | null) => void
  ): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]';
    
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `expense-tracker-backup-${timestamp}.json`;
    const locations = this.getBackupLocations();
    const defaultLocation = this.getDefaultBackupLocation();

    modal.innerHTML = `
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div class="p-6 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">Choose Backup Location</h3>
          <p class="text-slate-500 text-sm mt-1">Select where to save your backup file</p>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Filename</label>
            <input 
              type="text" 
              id="backup-filename"
              value="${defaultFilename}"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter filename"
            />
          </div>

          ${locations.length > 0 ? `
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Recent Locations</label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                ${locations.map((loc, index) => `
                  <label class="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="backup-location" 
                      value="${index}"
                      ${loc.path === defaultLocation ? 'checked' : ''}
                      class="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-slate-900 truncate">${loc.name}</div>
                      <div class="text-xs text-slate-500 truncate">${loc.path}</div>
                      <div class="text-xs text-slate-400">Last used: ${new Date(loc.lastUsed).toLocaleDateString()}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="border-t border-slate-200 pt-4">
            <label class="flex items-center gap-3 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input 
                type="radio" 
                name="backup-location" 
                value="new"
                ${locations.length === 0 ? 'checked' : ''}
                class="text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div class="font-medium text-slate-900">Choose new location</div>
                <div class="text-xs text-slate-500">Browser will prompt for download location</div>
              </div>
            </label>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="text-sm text-blue-800">
              <strong>Note:</strong> Due to browser security, we cannot directly access your file system. 
              The file will be downloaded to your default Downloads folder or a location you choose.
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-200 flex gap-3">
          <button 
            id="backup-cancel"
            class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            id="backup-confirm"
            class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create Backup
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    const cancelBtn = modal.querySelector('#backup-cancel') as HTMLButtonElement;
    const confirmBtn = modal.querySelector('#backup-confirm') as HTMLButtonElement;
    const filenameInput = modal.querySelector('#backup-filename') as HTMLInputElement;

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      onComplete(null);
    });

    confirmBtn.addEventListener('click', () => {
      const filename = filenameInput.value.trim();
      if (!filename) {
        alert('Please enter a filename');
        return;
      }

      const selectedLocation = modal.querySelector('input[name="backup-location"]:checked') as HTMLInputElement;
      const locationIndex = selectedLocation?.value;

      let selectedLocationData: BackupLocation | undefined;

      if (locationIndex !== 'new' && locationIndex !== undefined) {
        selectedLocationData = locations[parseInt(locationIndex)];
        if (selectedLocationData) {
          // Update last used time
          selectedLocationData.lastUsed = new Date().toISOString();
          this.saveBackupLocation(selectedLocationData);
          this.setDefaultBackupLocation(selectedLocationData.path);
        }
      }

      document.body.removeChild(modal);
      onComplete({ filename, location: selectedLocationData });
    });

    // Handle Enter key
    filenameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        confirmBtn.click();
      }
    });

    return modal;
  }

  /**
   * Create a complete backup of all application data
   */
  static async createFullBackup(): Promise<BackupData> {
    return await indexedDBStorage.createFullBackup();
  }

  /**
   * Download backup with location prompt
   */
  static async downloadBackupWithPrompt(): Promise<void> {
    const locationResult = await this.promptForBackupLocation();
    if (!locationResult) return;

    const backup = await this.createFullBackup();
    this.downloadJSON(backup, locationResult.filename);

    // Save this as a recent location (simulated since we can't know actual path)
    if (!locationResult.location) {
      const newLocation: BackupLocation = {
        path: 'Downloads', // Browser default
        name: 'Downloads Folder',
        lastUsed: new Date().toISOString()
      };
      this.saveBackupLocation(newLocation);
    }
  }

  /**
   * Download backup as JSON file
   */
  static async downloadBackup(filename?: string): Promise<void> {
    console.log('FileBackupManager.downloadBackup called with filename:', filename);
    try {
      const backup = await indexedDBStorage.createFullBackup();
      console.log('Backup data created:', backup);
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `expense-tracker-backup-${timestamp}.json`;
      
      const finalFilename = filename || defaultFilename;
      console.log('About to call downloadJSON with filename:', finalFilename);
      this.downloadJSON(backup, finalFilename);
      console.log('Download initiated for file:', filename || defaultFilename);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Download backup with location prompt
   */
  static async downloadBackupWithPrompt(): Promise<void> {
    console.log('FileBackupManager.downloadBackupWithPrompt called');
    try {
      const locationResult = await this.promptForBackupLocation();
      console.log('Location result:', locationResult);
      if (!locationResult) return;

      const backup = await indexedDBStorage.createFullBackup();
      console.log('Backup data for prompt:', backup);
      console.log('About to call downloadJSON with filename:', locationResult.filename);
      this.downloadJSON(backup, locationResult.filename);
      console.log('downloadJSON call completed');

      // Save this as a recent location (simulated since we can't know actual path)
      if (!locationResult.location) {
        const newLocation: BackupLocation = {
          path: 'Downloads', // Browser default
          name: 'Downloads Folder',
          lastUsed: new Date().toISOString()
        };
        this.saveBackupLocation(newLocation);
      }
    } catch (error) {
      console.error('Backup with prompt failed:', error);
      alert('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Download backup as human-readable format
   */
  static async downloadReadableBackup(filename?: string): Promise<void> {
    console.log('FileBackupManager.downloadReadableBackup called');
    try {
      const backup = await indexedDBStorage.createFullBackup();
      console.log('Readable backup data:', backup);
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultFilename = `expense-tracker-readable-${timestamp}.txt`;
      
      const readable = this.formatReadableBackup(backup);
      console.log('Formatted readable backup length:', readable.length);
      this.downloadText(readable, filename || defaultFilename);
    } catch (error) {
      console.error('Readable backup failed:', error);
      alert('Readable backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create a blank backup file for users to set up new backup files
   */
  static async createBlankBackupFile(): Promise<void> {
    console.log('FileBackupManager.createBlankBackupFile called');
    try {
      const timestamp = new Date().toISOString();
      const blankBackup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp,
        users: [],
        categories: [],
        subcategories: [],
        expenses: [],
        credentials: {
          username: 'admin',
          password: 'pass123',
          email: 'admin@example.com',
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue',
          useCase: 'personal-team'
        },
        settings: {
          fontSize: 'small',
          auth: 'false'
        },
        useCase: 'personal-team'
      };

      const filename = `expense-tracker-blank-${new Date().toISOString().split('T')[0]}.json`;
      console.log('Creating blank backup with filename:', filename);
      this.downloadJSON(blankBackup, filename);
    } catch (error) {
      console.error('Create blank backup failed:', error);
      alert('Create blank backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Restore data from backup file
   */
  static async restoreFromFile(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const content = await this.readFileAsText(file);
      const backup: BackupData = JSON.parse(content);

      // Validate backup format
      if (!this.validateBackup(backup)) {
        return { success: false, message: 'Invalid backup file format' };
      }

      // Restore data
      await indexedDBStorage.restoreFromBackup(backup);

      return { 
        success: true, 
        message: `Successfully restored backup from ${new Date(backup.timestamp).toLocaleDateString()}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Private helper methods
  private static getLocalStorageItem(key: string, defaultValue: any): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setLocalStorageItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save to localStorage key "${key}":`, error);
    }
  }

  private static downloadJSON(data: any, filename: string): void {
    console.log('downloadJSON called with filename:', filename, 'data size:', JSON.stringify(data).length);
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      console.log('Blob created, size:', blob.size);
      this.downloadBlob(blob, filename);
      console.log('downloadBlob called successfully');
    } catch (error) {
      console.error('Error in downloadJSON:', error);
      throw error;
    }
  }

  private static downloadText(text: string, filename: string): void {
    const blob = new Blob([text], { 
      type: 'text/plain;charset=utf-8;' 
    });
    this.downloadBlob(blob, filename);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    console.log('downloadBlob called with filename:', filename, 'blob size:', blob.size);
    try {
      // Always use the manual save dialog for WebContainer/StackBlitz environments
      console.log('Using manual save dialog for WebContainer environment');
      this.showManualSaveDialog(blob, filename);
    } catch (error) {
      console.error('Error in downloadBlob:', error);
      this.showManualSaveDialog(blob, filename);
    }
  }

  private static async showManualSaveDialog(blob: Blob, filename: string): Promise<void> {
    try {
      const text = await blob.text();
      console.log('Manual save dialog - text length:', text.length);
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
          <div class="p-6 border-b border-slate-200">
            <h3 class="text-lg font-bold text-slate-900">Manual Backup Save</h3>
            <p class="text-slate-500">Your backup is ready - copy and save manually</p>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-700 mb-4">
              Due to browser security restrictions, please copy the backup data below and save it as <strong>${filename}</strong>:
            </p>
            <textarea 
              readonly 
              class="w-full h-64 p-3 border border-slate-300 rounded-lg font-mono text-xs"
              onclick="this.select()"
              id="backup-textarea"
            >${text}</textarea>
            <div class="flex gap-3 mt-4">
              <button 
                id="copy-button"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy to Clipboard
              </button>
              <button 
                id="close-button"
                class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add event listeners
      const copyButton = modal.querySelector('#copy-button') as HTMLButtonElement;
      const closeButton = modal.querySelector('#close-button') as HTMLButtonElement;
      const textarea = modal.querySelector('#backup-textarea') as HTMLTextAreaElement;
      
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          copyButton.textContent = 'Copied!';
          copyButton.className = 'px-4 py-2 bg-green-600 text-white rounded-lg';
          setTimeout(() => {
            copyButton.textContent = 'Copy to Clipboard';
            copyButton.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';
          }, 2000);
        } catch (error) {
          console.error('Clipboard copy failed:', error);
          textarea.select();
          alert('Copy failed - text is selected, please copy manually with Ctrl+C');
        }
      });
      
      closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Auto-select text for easy copying
      textarea.select();
      
      console.log('Manual save dialog shown');
    } catch (error) {
      console.error('Failed to show manual save dialog:', error);
      alert('Backup failed: Unable to create backup file. Please try again.');
    }
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static validateBackup(backup: any): backup is BackupData {
    return (
      backup &&
      typeof backup === 'object' &&
      backup.version &&
      backup.timestamp &&
      Array.isArray(backup.users) &&
      Array.isArray(backup.categories) &&
      Array.isArray(backup.expenses) &&
      backup.credentials &&
      backup.settings &&
      backup.useCase
    );
  }

  private static formatReadableBackup(backup: BackupData): string {
    const lines: string[] = [];
    
    lines.push('EXPENSE TRACKER BACKUP');
    lines.push('='.repeat(50));
    lines.push(`Backup Date: ${new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(new Date(backup.timestamp))}`);
    lines.push(`Version: ${backup.version}`);
    lines.push(`Use Case: ${backup.useCase || 'personal-team'}`);
    lines.push('');

    // Users section
    lines.push('USERS:');
    lines.push('-'.repeat(20));
    if (backup.users.length === 0) {
      lines.push('No users found');
    } else {
      backup.users.forEach((user: any, index: number) => {
        lines.push(`${index + 1}. ${user.name} (${user.username})`);
        lines.push(`   Email: ${user.email}`);
        lines.push(`   Default Location: ${user.defaultStoreLocation || 'None'}`);
        lines.push('');
      });
    }

    // Categories section
    lines.push('CATEGORIES:');
    lines.push('-'.repeat(20));
    if (backup.categories.length === 0) {
      lines.push('No categories found');
    } else {
      backup.categories.forEach((category: any, index: number) => {
        lines.push(`${index + 1}. ${category.name} (${category.icon})`);
        if (category.subcategories?.length > 0) {
          category.subcategories.forEach((sub: any) => {
            lines.push(`   - ${sub.name}`);
          });
        }
        lines.push('');
      });
    }

    // Expenses summary
    lines.push('EXPENSES SUMMARY:');
    lines.push('-'.repeat(20));
    lines.push(`Total Expenses: ${backup.expenses.length}`);
    
    if (backup.expenses.length > 0) {
      const totalAmount = backup.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      lines.push(`Total Amount: $${totalAmount.toFixed(2)}`);
      
      const dates = backup.expenses.map((exp: any) => new Date(exp.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      lines.push(`Date Range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`);
      
      // Recent expenses
      lines.push('');
      lines.push('RECENT EXPENSES (Last 10):');
      lines.push('-'.repeat(20));
      const recentExpenses = backup.expenses
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      
      recentExpenses.forEach((expense: any, index: number) => {
        const user = backup.users.find((u: any) => u.id === expense.userId);
        const category = backup.categories.find((c: any) => c.id === expense.categoryId);
        lines.push(`${index + 1}. $${expense.amount.toFixed(2)} - ${expense.description}`);
        lines.push(`   User: ${user?.name || 'Unknown'}`);
        lines.push(`   Category: ${category?.name || 'Unknown'}`);
        lines.push(`   Date: ${new Date(expense.date).toLocaleDateString()}`);
        if (expense.storeName) {
          lines.push(`   Store: ${expense.storeName}`);
        }
        lines.push('');
      });
    } else {
      lines.push('No expenses found');
      lines.push('');
    }

    return lines.join('\n');
  }
}