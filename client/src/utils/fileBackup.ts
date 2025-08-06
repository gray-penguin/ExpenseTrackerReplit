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

import { indexedDBStorage } from './indexedDBStorage';

export class FileBackupManager {
  private static readonly BACKUP_VERSION = '1.0.0';

  /**
   * Create a complete backup of all application data
   */
  static async createFullBackup(): Promise<BackupData> {
    return await indexedDBStorage.createFullBackup();
  }

  /**
   * Download backup as JSON file - SIMPLE VERSION
   */
  static async downloadBackup(filename?: string): Promise<void> {
    try {
      const backup = await this.createFullBackup();
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = filename || `expense-tracker-backup-${timestamp}.json`;
      
      // Create the file content
      const jsonString = JSON.stringify(backup, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Download backup with user-specified filename
   */
  static async downloadBackupWithPrompt(): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `expense-tracker-backup-${timestamp}.json`;
    const filename = prompt('Enter filename for backup:', defaultFilename);
    
    if (filename) {
      await this.downloadBackup(filename);
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
}