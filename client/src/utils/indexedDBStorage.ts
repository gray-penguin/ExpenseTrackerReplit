import { User, Category, Expense } from '../types';
import { SavedReport } from '../types';
import { InstallationCodeManager } from './installationCode';
import { mockUsers } from '../data/mockUsers';
import { mockCategories } from '../data/mockCategories';
import { MockExpenseGenerator } from '../data/mockExpenseGenerator';
import { defaultCredentials, defaultSettings } from '../data/defaultCredentials';

export interface BackupData {
  version: string;
  timestamp: string;
  users: any[];
  categories: any[];
  subcategories?: any[];
  expenses: any[];
  savedReports?: any[];
  credentials: any;
  settings: any;
  useCase?: string;
}

export class IndexedDBStorage {
  private static readonly DB_NAME = 'ExpenseTrackerDB';
  private static readonly DB_VERSION = 5;
  private static readonly STORES = {
    users: 'users',
    categories: 'categories',
    expenses: 'expenses',
    savedReports: 'savedReports',
    credentials: 'credentials',
    settings: 'settings'
  };

  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // Implement singleton pattern to prevent race conditions
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDBStorage.DB_NAME, IndexedDBStorage.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        Object.values(IndexedDBStorage.STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });

        // Create a simple key-value store for settings and credentials
        if (!db.objectStoreNames.contains('keyValue')) {
          db.createObjectStore('keyValue');
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  private async getKeyValueStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(['keyValue'], mode);
    return transaction.objectStore('keyValue');
  }

  async getUsers(): Promise<User[]> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.users);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting users from IndexedDB:', error);
      return [];
    }
  }

  async setUsers(users: User[]): Promise<void> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.users, 'readwrite');
      
      // Clear existing users
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Add new users
      for (const user of users) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(user);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error setting users in IndexedDB:', error);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.categories);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting categories from IndexedDB:', error);
      return [];
    }
  }

  async setCategories(categories: Category[]): Promise<void> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.categories, 'readwrite');
      
      // Clear existing categories
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Add new categories
      for (const category of categories) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(category);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error setting categories in IndexedDB:', error);
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.expenses);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting expenses from IndexedDB:', error);
      return [];
    }
  }

  async setExpenses(expenses: Expense[]): Promise<void> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.expenses, 'readwrite');
      
      // Clear existing expenses
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Add new expenses
      for (const expense of expenses) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(expense);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error setting expenses in IndexedDB:', error);
    }
  }

  async getSavedReports(): Promise<SavedReport[]> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.savedReports);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting saved reports from IndexedDB:', error);
      return [];
    }
  }

  async setSavedReports(reports: SavedReport[]): Promise<void> {
    try {
      const store = await this.getStore(IndexedDBStorage.STORES.savedReports, 'readwrite');
      
      // Clear existing reports
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Add new reports
      for (const report of reports) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(report);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error setting saved reports in IndexedDB:', error);
    }
  }

  async getCredentials(): Promise<any> {
    try {
      const store = await this.getKeyValueStore();
      return new Promise((resolve, reject) => {
        const request = store.get('credentials');
        request.onsuccess = () => {
          const result = request.result;
          console.log('IndexedDB getCredentials raw result:', result);
          
          const defaultCredentials = {
            username: 'admin',
            password: 'pass123',
            email: 'admin@example.com',
            securityQuestion: 'What is your favorite color?',
            securityAnswer: 'blue',
            useCase: 'personal-team'
          };
          
          const credentials = result || defaultCredentials;
          console.log('IndexedDB getCredentials returning:', credentials);
          
          resolve(credentials);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting credentials from IndexedDB:', error);
      return {
        username: 'admin',
        password: 'pass123',
        email: 'admin@example.com',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',
        useCase: 'family-expenses'
      };
    }
  }

  async setCredentials(credentials: any): Promise<void> {
    try {
      console.log('IndexedDB setCredentials called with:', credentials);
      const store = await this.getKeyValueStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(credentials, 'credentials');
        request.onsuccess = () => {
          console.log('IndexedDB setCredentials success');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
      
      // Verify the data was saved correctly
      const savedCredentials = await this.getCredentials();
      console.log('IndexedDB setCredentials verification - saved data:', savedCredentials);
    } catch (error) {
      console.error('Error setting credentials in IndexedDB:', error);
      throw error;
    }
  }

  async getSettings(): Promise<any> {
    try {
      const store = await this.getKeyValueStore();
      return new Promise((resolve, reject) => {
        const request = store.get('settings');
        request.onsuccess = () => {
          resolve(request.result || {
            fontSize: 'small',
            auth: 'false'
          });
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting settings from IndexedDB:', error);
      return {
        fontSize: 'small',
        auth: 'false'
      };
    }
  }

  async setSettings(settings: any): Promise<void> {
    try {
      const store = await this.getKeyValueStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(settings, 'settings');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting settings in IndexedDB:', error);
    }
  }

  async getAuthState(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.auth === 'true';
  }

  async setAuthState(isAuthenticated: boolean): Promise<void> {
    const settings = await this.getSettings();
    await this.setSettings({ ...settings, auth: isAuthenticated ? 'true' : 'false' });
  }

  async initializeMockData(): Promise<void> {
    try {
      // Check if already initialized by looking for users
      const existingUsers = await this.getUsers();
      const existingExpenses = await this.getExpenses();
      const existingCredentials = await this.getCredentials();
      
      // Only initialize mock data if no existing data is found
      if (existingUsers.length === 0 && existingExpenses.length === 0) {
        console.log('No existing data found, initializing with Jones family mock data');
        await this.createMockData();
      } else {
        console.log('Existing data found, preserving user data');
        // Only set use case if it's completely missing, don't override existing user choices
        if (!existingCredentials.useCase) {
          console.log('No use case found, setting default to personal-team');
          await this.setCredentials({
            ...existingCredentials,
            useCase: defaultCredentials.useCase,
            authEnabled: existingCredentials.authEnabled !== undefined ? existingCredentials.authEnabled : true
          });
        } else {
          console.log('Preserving existing use case:', existingCredentials.useCase);
          // Ensure authEnabled is set if missing
          if (existingCredentials.authEnabled === undefined) {
            await this.setCredentials({
              ...existingCredentials,
              authEnabled: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  private async createMockData(): Promise<void> {
    // Set default credentials
    await this.setCredentials(defaultCredentials);

    // Create users with IDs
    const usersWithIds = mockUsers.map((user, index) => ({
      ...user,
      id: (index + 1).toString()
    }));

    // Create categories with IDs
    const categoriesWithIds = mockCategories.map((category, index) => ({
      ...category,
      id: (index + 1).toString()
    }));

    // Generate mock expenses using the generator
    const mockExpensesData = MockExpenseGenerator.generate({
      numberOfExpenses: 500,
      userIds: ['1', '2', '3', '4']
    });

    // Add IDs to expenses
    const expensesWithIds = mockExpensesData.map((expense, index) => ({
      ...expense,
      id: (index + 1).toString()
    }));

    await Promise.all([
      this.setUsers(usersWithIds),
      this.setCategories(categoriesWithIds),
      this.setExpenses(expensesWithIds)
    ]);
  }

  async createFullBackup(): Promise<BackupData> {
    console.log('IndexedDBStorage.createFullBackup called');
    try {
      const [users, categories, expenses, savedReports, credentials, settings, installationInfo] = await Promise.all([
        this.getUsers(),
        this.getCategories(),
        this.getExpenses(),
        this.getSavedReports(),
        this.getCredentials(),
        this.getSettings(),
        InstallationCodeManager.getInstallationInfo()
      ]);

      console.log('Retrieved data for backup:', { 
        usersCount: users.length, 
        categoriesCount: categories.length, 
        expensesCount: expenses.length,
        savedReportsCount: savedReports.length,
        credentials: !!credentials,
        settings: !!settings
      });
      const flatCategories = categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        icon: category.icon,
        color: category.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const flatSubcategories = categories.flatMap(category =>
        category.subcategories.map(subcategory => ({
          id: subcategory.id.toString(),
          name: subcategory.name,
          categoryId: category.id.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      );

      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        installationCode: installationInfo.code,
        users,
        categories: flatCategories,
        subcategories: flatSubcategories,
        expenses,
        savedReports,
        credentials,
        settings,
        useCase: credentials.useCase || 'personal-team'
      };

      console.log('Created backup data:', backupData);
      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async restoreFromBackup(backup: BackupData): Promise<void> {
    console.log('Restoring from backup, use case in backup:', backup.useCase, backup.credentials?.useCase);
    
    // Extract use case from backup - check multiple possible locations
    const backupUseCase = backup.useCase || backup.credentials?.useCase || 'personal-team';
    console.log('Extracted use case from backup:', backupUseCase);
    
    let nestedCategories;
    
    if (backup.subcategories && Array.isArray(backup.subcategories)) {
      nestedCategories = backup.categories.map(category => {
        return {
          id: category.id.toString(),
          name: category.name,
          icon: category.icon,
          color: category.color,
          subcategories: backup.subcategories
            .filter(sub => sub.categoryId === category.id)
            .map(sub => {
              return {
                id: sub.id.toString(),
                name: sub.name,
                categoryId: category.id.toString()
              };
            })
        };
      });
    } else {
      nestedCategories = backup.categories.map(category => {
        return {
          id: category.id.toString(),
          name: category.name,
          icon: category.icon,
          color: category.color,
          subcategories: (category.subcategories || []).map((sub: any) => {
            return {
              id: sub.id.toString(),
              name: sub.name,
              categoryId: category.id.toString()
            };
          })
        };
      });
    }

    // Handle saved reports if they exist in the backup
    const processedSavedReports = backup.savedReports ? backup.savedReports.map((report: any) => ({
      ...report,
      id: report.id?.toString() || '',
      createdAt: report.createdAt || new Date().toISOString(),
      lastUsed: report.lastUsed || report.createdAt || new Date().toISOString()
    })) : [];

    const processedExpenses = backup.expenses.map((expense: any) => ({
      ...expense,
      id: expense.id?.toString() || '',
      userId: (expense.userId || expense.personId)?.toString() || '',
      categoryId: expense.categoryId?.toString() || '',
      subcategoryId: expense.subcategoryId?.toString() || '',
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : (expense.amount || 0),
      createdAt: expense.createdAt || expense.updatedAt || new Date().toISOString()
    }));

    const processedUsers = backup.users.map((user: any) => ({
      ...user,
      id: user.id?.toString() || '',
      username: user.username || user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user',
      email: user.email || `${user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@example.com`,
      avatar: user.avatar || user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
      color: user.color || 'bg-blue-500',
      defaultCategoryId: user.defaultCategoryId ? user.defaultCategoryId.toString() : undefined,
      defaultSubcategoryId: user.defaultSubcategoryId ? user.defaultSubcategoryId.toString() : undefined
    }));

    // Ensure credentials include the use case from the backup
    const processedCredentials = {
      username: backup.credentials?.username || 'admin',
      password: backup.credentials?.password || 'pass123',
      email: backup.credentials?.email || 'admin@example.com',
      securityQuestion: backup.credentials?.securityQuestion || 'What is your favorite color?',
      securityAnswer: backup.credentials?.securityAnswer || 'blue',
      useCase: backupUseCase
    };
    
    console.log('Processed credentials with use case:', processedCredentials);
    await Promise.all([
      this.setUsers(processedUsers),
      this.setCategories(nestedCategories),
      this.setExpenses(processedExpenses),
      this.setSavedReports(processedSavedReports),
      this.setCredentials(processedCredentials),
      this.setSettings(backup.settings)
    ]);
    
    console.log('Restore completed successfully');
    
    // Verify the use case was actually saved
    const verifyCredentials = await this.getCredentials();
    console.log('Post-restore verification - use case in DB:', verifyCredentials.useCase);
  }
}

export const indexedDBStorage = new IndexedDBStorage();