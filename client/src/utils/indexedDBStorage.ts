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
  private static readonly DB_VERSION = 3;
  private static readonly STORES = {
    users: 'users',
    categories: 'categories',
    expenses: 'expenses',
    credentials: 'credentials',
    settings: 'settings'
  };

  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDBStorage.DB_NAME, IndexedDBStorage.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete existing stores if they exist to recreate with proper keyPath
        if (db.objectStoreNames.contains(IndexedDBStorage.STORES.credentials)) {
          db.deleteObjectStore(IndexedDBStorage.STORES.credentials);
        }
        if (db.objectStoreNames.contains(IndexedDBStorage.STORES.settings)) {
          db.deleteObjectStore(IndexedDBStorage.STORES.settings);
        }

        // Create object stores
        if (!db.objectStoreNames.contains(IndexedDBStorage.STORES.users)) {
          db.createObjectStore(IndexedDBStorage.STORES.users, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(IndexedDBStorage.STORES.categories)) {
          db.createObjectStore(IndexedDBStorage.STORES.categories, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(IndexedDBStorage.STORES.expenses)) {
          db.createObjectStore(IndexedDBStorage.STORES.expenses, { keyPath: 'id' });
        }
        
        // Always create credentials and settings stores with proper keyPath
        db.createObjectStore(IndexedDBStorage.STORES.credentials, { keyPath: 'id' });
        db.createObjectStore(IndexedDBStorage.STORES.settings, { keyPath: 'id' });
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async set<T>(storeName: string, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async setAll<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clear existing data first
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add all new items
        let completed = 0;
        const total = items.length;
        
        if (total === 0) {
          resolve();
          return;
        }

        items.forEach(item => {
          const addRequest = store.put(item);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Specific methods for each data type
  async getUsers(): Promise<any[]> {
    return this.getAll(IndexedDBStorage.STORES.users);
  }

  async setUsers(users: any[]): Promise<void> {
    return this.setAll(IndexedDBStorage.STORES.users, users);
  }

  async getCategories(): Promise<any[]> {
    return this.getAll(IndexedDBStorage.STORES.categories);
  }

  async setCategories(categories: any[]): Promise<void> {
    return this.setAll(IndexedDBStorage.STORES.categories, categories);
  }

  async getExpenses(): Promise<any[]> {
    return this.getAll(IndexedDBStorage.STORES.expenses);
  }

  async setExpenses(expenses: any[]): Promise<void> {
    return this.setAll(IndexedDBStorage.STORES.expenses, expenses);
  }

  async getCredentials(): Promise<any> {
    const result = await this.get(IndexedDBStorage.STORES.credentials, 'main');
    return result || {
      username: 'admin',
      password: 'pass123',
      email: 'admin@example.com',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      useCase: 'personal-team'
    };
  }

  async setCredentials(credentials: any): Promise<void> {
    return this.set(IndexedDBStorage.STORES.credentials, { id: 'main', ...credentials });
  }

  async getSettings(): Promise<any> {
    const result = await this.get(IndexedDBStorage.STORES.settings, 'main');
    return result || {
      fontSize: 'small',
      auth: 'false'
    };
  }

  async setSettings(settings: any): Promise<void> {
    return this.set(IndexedDBStorage.STORES.settings, { id: 'main', ...settings });
  }

  async getAuthState(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.auth === 'true';
  }

  async setAuthState(isAuthenticated: boolean): Promise<void> {
    const settings = await this.getSettings();
    await this.setSettings({ ...settings, auth: isAuthenticated ? 'true' : 'false' });
  }

  // Initialize with mock data if database is empty
  async initializeMockData(): Promise<void> {
    const users = await this.getUsers();
    const categories = await this.getCategories();
    const expenses = await this.getExpenses();

    // Initialize if stores are empty OR if expenses have missing user associations
    const hasCorruptedExpenses = expenses.some(expense => !expense.userId || expense.userId === '');
    
    if ((users.length === 0 && categories.length === 0 && expenses.length === 0) || hasCorruptedExpenses) {
      console.log('Initializing mock data due to empty stores or corrupted user associations');
      
      // Initialize mock users
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
          defaultSubcategoryId: '4',
          defaultStoreLocation: 'Uptown'
        }
      ];

      // Initialize mock categories
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

      // If we have corrupted expenses, try to repair them first
      let repairedExpenses = [];
      if (hasCorruptedExpenses && expenses.length > 0) {
        console.log('Attempting to repair corrupted expenses...');
        repairedExpenses = expenses.map((expense, index) => {
          // If userId is missing or empty, assign to alternating users
          const assignedUserId = (!expense.userId || expense.userId === '') 
            ? (index % 2 === 0 ? '1' : '2')
            : expense.userId.toString();
            
          return {
            ...expense,
            userId: assignedUserId,
            categoryId: expense.categoryId?.toString() || '1',
            subcategoryId: expense.subcategoryId?.toString() || '1',
            amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : (expense.amount || 0)
          };
        });
        console.log(`Repaired ${repairedExpenses.length} expenses with user associations`);
      } else {
        // Initialize with fresh mock expenses if no existing data
        repairedExpenses = [
          {
            id: '1',
            userId: '1',
            categoryId: '1',
            subcategoryId: '1',
            amount: 45.67,
            description: 'Weekly fresh vegetables and fruits',
            notes: 'Organic produce from farmers market',
            storeName: 'Whole Foods Market',
            storeLocation: 'Downtown',
            date: '2025-01-15',
            createdAt: '2025-01-15T10:30:00Z'
          },
          {
            id: '2',
            userId: '1',
            categoryId: '1',
            subcategoryId: '2',
            amount: 32.89,
            description: 'Chicken breast and milk',
            storeName: 'Safeway',
            storeLocation: 'Downtown',
            date: '2025-01-14',
            createdAt: '2025-01-14T18:45:00Z'
          },
          {
            id: '3',
            userId: '2',
            categoryId: '2',
            subcategoryId: '5',
            amount: 125.45,
            description: 'Monthly electricity bill',
            notes: 'Higher usage due to cold weather',
            storeName: 'Seattle City Light',
            storeLocation: 'Online',
            date: '2025-01-10',
            createdAt: '2025-01-10T08:00:00Z'
          },
          {
            id: '4',
            userId: '2',
            categoryId: '3',
            subcategoryId: '12',
            amount: 15.99,
            description: 'Netflix subscription',
            storeName: 'Netflix',
            storeLocation: 'Online',
            date: '2025-01-01',
            createdAt: '2025-01-01T00:05:00Z'
          }
        ];
      }

      await this.setUsers(mockUsers);
      await this.setCategories(mockCategories);
      await this.setExpenses(repairedExpenses);

      // Set default credentials with Personal Team Expenses use case
      await this.setCredentials({
        username: 'admin',
        password: 'pass123',
        email: 'admin@example.com',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',
        useCase: 'personal-team'
      });

      // Set default settings
      await this.setSettings({
        fontSize: 'small',
        auth: 'false'
      });
    }
  }

  // Backup and restore methods
  async createFullBackup(): Promise<BackupData> {
    const [users, categories, expenses, credentials, settings] = await Promise.all([
      this.getUsers(),
      this.getCategories(),
      this.getExpenses(),
      this.getCredentials(),
      this.getSettings()
    ]);

    // Transform categories to flat structure with timestamps
    const flatCategories = categories.map(category => ({
      id: category.id.toString(),
      name: category.name,
      icon: category.icon,
      color: category.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Extract subcategories as separate array with timestamps
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
  }

  async restoreFromBackup(backup: BackupData): Promise<void> {
    // Handle both old nested format and new flat format
    let nestedCategories;
    
    if (backup.subcategories && Array.isArray(backup.subcategories)) {
      // New flat format - transform flat categories and subcategories back to nested structure
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
      // Old nested format - use categories as-is
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

    // Ensure all expenses have proper numeric amounts and string IDs
    const processedExpenses = backup.expenses.map(expense => ({
      ...expense,
      id: expense.id?.toString() || '',
      userId: expense.userId?.toString() || '',
      categoryId: expense.categoryId?.toString() || '',
      subcategoryId: expense.subcategoryId?.toString() || '',
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : (expense.amount || 0)
    }));

    // Ensure all users have string IDs
    const processedUsers = backup.users.map(user => ({
      ...user,
      id: user.id?.toString() || '',
      username: user.username || user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user',
      email: user.email || `${user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@example.com`,
      defaultCategoryId: user.defaultCategoryId ? user.defaultCategoryId.toString() : undefined,
      defaultSubcategoryId: user.defaultSubcategoryId ? user.defaultSubcategoryId.toString() : undefined
    }));
    await Promise.all([
      this.setUsers(processedUsers),
      this.setCategories(nestedCategories),
      this.setExpenses(processedExpenses),
      this.setCredentials(backup.credentials),
    ]);
  }
}

// Create singleton instance
export const indexedDBStorage = new IndexedDBStorage();