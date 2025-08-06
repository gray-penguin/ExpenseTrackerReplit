import { User, Category, Expense } from '../types';

export interface BackupData {
  version: string;
  timestamp: string;
  users: any[];
  categories: any[];
  subcategories?: any[];
  expenses: any[];
  credentials: any;
  settings: any;
  useCase?: string;
}

export class IndexedDBStorage {
  private static readonly DB_NAME = 'ExpenseTrackerDB';
  private static readonly DB_VERSION = 4;
  private static readonly STORES = {
    users: 'users',
    categories: 'categories',
    expenses: 'expenses',
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

  async getCredentials(): Promise<any> {
    try {
      const store = await this.getKeyValueStore();
      return new Promise((resolve, reject) => {
        const request = store.get('credentials');
        request.onsuccess = () => {
          resolve(request.result || {
            username: 'admin',
            password: 'pass123',
            email: 'admin@example.com',
            securityQuestion: 'What is your favorite color?',
            securityAnswer: 'blue',
            useCase: 'personal-team'
          });
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
        useCase: 'personal-team'
      };
    }
  }

  async setCredentials(credentials: any): Promise<void> {
    try {
      const store = await this.getKeyValueStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(credentials, 'credentials');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting credentials in IndexedDB:', error);
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
      if (existingUsers.length > 0) {
        console.log('Mock data already exists, skipping initialization');
        return;
      }

      console.log('Initializing with mock data');
      await this.createMockData();
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  private async createMockData(): Promise<void> {
    const mockUsers = [
      {
        id: '1',
        name: 'Alex Chen',
        username: 'alexc',
        email: 'alex.chen@example.com',
        avatar: 'AC',
        color: 'bg-emerald-500',
        defaultCategoryId: '1',
        defaultSubcategoryId: '1',
        defaultStoreLocation: 'Downtown'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        username: 'sarahj',
        email: 'sarah.johnson@example.com',
        avatar: 'SJ',
        color: 'bg-blue-500',
        defaultCategoryId: '2',
        defaultSubcategoryId: '5',
        defaultStoreLocation: 'Uptown'
      }
    ];

    const mockCategories = [
      {
        id: '1',
        name: 'Groceries',
        icon: 'ShoppingCart',
        color: 'text-green-600',
        subcategories: [
          { id: '1', name: 'Fresh Produce', categoryId: '1' },
          { id: '2', name: 'Meat & Dairy', categoryId: '1' },
          { id: '3', name: 'Pantry Items', categoryId: '1' },
          { id: '4', name: 'Snacks & Beverages', categoryId: '1' }
        ]
      },
      {
        id: '2',
        name: 'Utilities',
        icon: 'Zap',
        color: 'text-yellow-600',
        subcategories: [
          { id: '5', name: 'Electricity', categoryId: '2' },
          { id: '6', name: 'Water & Sewer', categoryId: '2' },
          { id: '7', name: 'Internet & Cable', categoryId: '2' },
          { id: '8', name: 'Gas', categoryId: '2' }
        ]
      },
      {
        id: '3',
        name: 'Entertainment',
        icon: 'Music',
        color: 'text-purple-600',
        subcategories: [
          { id: '9', name: 'Movies & Shows', categoryId: '3' },
          { id: '10', name: 'Gaming', categoryId: '3' },
          { id: '11', name: 'Concerts & Events', categoryId: '3' },
          { id: '12', name: 'Subscriptions', categoryId: '3' }
        ]
      },
      {
        id: '4',
        name: 'Automobile',
        icon: 'Car',
        color: 'text-blue-600',
        subcategories: [
          { id: '13', name: 'Fuel', categoryId: '4' },
          { id: '14', name: 'Maintenance', categoryId: '4' },
          { id: '15', name: 'Insurance', categoryId: '4' },
          { id: '16', name: 'Parking & Tolls', categoryId: '4' }
        ]
      }
    ];

    const mockExpenses = [
      {
        id: '1',
        userId: '1',
        categoryId: '1',
        subcategoryId: '1',
        amount: 89.45,
        description: 'Weekly grocery shopping',
        notes: 'Bought fresh vegetables and meat for the week',
        storeName: 'Whole Foods Market',
        storeLocation: 'Downtown',
        date: '2025-01-18',
        createdAt: '2025-01-18T10:30:00Z'
      },
      {
        id: '2',
        userId: '1',
        categoryId: '4',
        subcategoryId: '13',
        amount: 45.00,
        description: 'Gas for car',
        notes: 'Filled up the tank',
        storeName: 'Shell Station',
        storeLocation: 'Main Street',
        date: '2025-01-17',
        createdAt: '2025-01-17T18:45:00Z'
      },
      {
        id: '3',
        userId: '2',
        categoryId: '2',
        subcategoryId: '5',
        amount: 125.50,
        description: 'Monthly electricity bill',
        notes: 'Higher than usual due to winter heating',
        storeName: 'City Electric',
        storeLocation: '',
        date: '2025-01-15',
        createdAt: '2025-01-15T08:00:00Z'
      },
      {
        id: '4',
        userId: '2',
        categoryId: '3',
        subcategoryId: '12',
        amount: 15.99,
        description: 'Netflix subscription',
        notes: 'Monthly streaming service',
        storeName: 'Netflix',
        storeLocation: 'Online',
        date: '2025-01-14',
        createdAt: '2025-01-14T20:00:00Z'
      }
    ];

    await Promise.all([
      this.setUsers(mockUsers),
      this.setCategories(mockCategories),
      this.setExpenses(mockExpenses)
    ]);
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

  async getCredentials(): Promise<any> {
    try {
      const store = await this.getKeyValueStore();
      return new Promise((resolve, reject) => {
        const request = store.get('credentials');
        request.onsuccess = () => {
          resolve(request.result || {
            username: 'admin',
            password: 'pass123',
            email: 'admin@example.com',
            securityQuestion: 'What is your favorite color?',
            securityAnswer: 'blue',
            useCase: 'personal-team'
          });
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
        useCase: 'personal-team'
      };
    }
  }

  async setCredentials(credentials: any): Promise<void> {
    try {
      const store = await this.getKeyValueStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(credentials, 'credentials');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting credentials in IndexedDB:', error);
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

  async createFullBackup(): Promise<BackupData> {
    try {
      const [users, categories, expenses, credentials, settings] = await Promise.all([
        this.getUsers(),
        this.getCategories(),
        this.getExpenses(),
        this.getCredentials(),
        this.getSettings()
      ]);

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

      return {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        users,
        categories: flatCategories,
        subcategories: flatSubcategories,
        expenses,
        credentials,
        settings,
        useCase: credentials.useCase || 'personal-team'
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async restoreFromBackup(backup: BackupData): Promise<void> {
    let nestedCategories;
    
    if (backup.subcategories && Array.isArray(backup.subcategories)) {
      nestedCategories = backup.categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        icon: category.icon,
        color: category.color,
        subcategories: backup.subcategories
          .filter(sub => sub.categoryId === category.id)
          .map(sub => ({
            id: sub.id.toString(),
            name: sub.name,
            categoryId: category.id.toString()
          }))
      }));
    } else {
      nestedCategories = backup.categories.map(category => ({
        id: category.id.toString(),
        name: category.name,
        icon: category.icon,
        color: category.color,
        subcategories: (category.subcategories || []).map((sub: any) => ({
          id: sub.id.toString(),
          name: sub.name,
          categoryId: category.id.toString()
        }))
      }));
    }

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

    await Promise.all([
      this.setUsers(processedUsers),
      this.setCategories(nestedCategories),
      this.setExpenses(processedExpenses),
      this.setCredentials(backup.credentials),
      this.setSettings(backup.settings)
    ]);
  }
}

export const indexedDBStorage = new IndexedDBStorage();