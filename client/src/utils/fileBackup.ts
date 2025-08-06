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
      
      // Trigger download
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
   * Download backup with location prompt
   */
  static async downloadBackupWithPrompt(): Promise<void> {
    const filename = prompt('Enter filename for backup:', `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    if (filename) {
      await this.downloadBackup(filename);
    }
  }

  /**
   * Download backup as human-readable format
   */
  static async downloadReadableBackup(filename?: string): Promise<void> {
    try {
      const backup = await this.createFullBackup();
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = filename || `expense-tracker-readable-${timestamp}.txt`;
      
      const readable = this.formatReadableBackup(backup);
      
      // Create blob and download
      const blob = new Blob([readable], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Readable backup failed:', error);
      alert('Readable backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create a blank backup file
   */
  static async createBlankBackupFile(): Promise<void> {
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
      const jsonString = JSON.stringify(blankBackup, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
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
    lines.push(`Backup Date: ${new Date(backup.timestamp).toLocaleDateString()}`);
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
    }

    return lines.join('\n');
  }
}