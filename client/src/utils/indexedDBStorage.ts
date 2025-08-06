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

  public db: IDBDatabase | null = null;
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized && this.db) {
      return; // Already initialized
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDBStorage.DB_NAME, IndexedDBStorage.DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        console.log('IndexedDB: Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('IndexedDB: Database upgrade needed');
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
        console.log('IndexedDB: Object stores created');
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
    // Only run once per session
    if (this.initialized) {
      console.log('IndexedDB: Already initialized, skipping mock data');
      return;
    }
    
    try {
      const [users, categories, expenses, settings] = await Promise.all([
        this.getUsers(),
        this.getCategories(),
        this.getExpenses(),
        this.getSettings()
      ]);

      // Check if user has real data flag set
      const hasRealData = settings.hasRealData === 'true';

      if (hasRealData) {
        console.log('IndexedDB: Real user data detected, skipping mock data initialization');
        await this.setSettings({ ...settings, initialized: 'true' });
        return;
      }

      // Check for any non-mock data indicators
      const hasNonMockUsers = users.some(user => 
        !['Alex Chen', 'Sarah Johnson'].includes(user.name) ||
        !['alexc', 'sarahj'].includes(user.username)
      );
      
      const hasNonMockExpenses = expenses.some(expense =>
        !['Weekly fresh vegetables and fruits', 'Chicken breast and milk', 'Monthly electricity bill', 'Netflix subscription', 'Weekly grocery shopping', 'Gas for car'].includes(expense.description)
      );

      // If we detect any real user data, mark as real and don't overwrite
      if (hasNonMockUsers || hasNonMockExpenses || users.length > 2 || expenses.length > 4) {
        console.log('IndexedDB: Non-mock data detected, preserving existing data');
        await this.setSettings({ ...settings, hasRealData: 'true' });
        await this.setSettings({ ...settings, hasRealData: 'true' });
        return;
      }

      // Only initialize mock data if all stores are completely empty
      if (users.length === 0 && categories.length === 0 && expenses.length === 0) {
        console.log('IndexedDB: Empty database detected, initializing with mock data');
        await this.createMockData();
      } else {
        console.log('IndexedDB: Existing data found, skipping mock data initialization');
        // Mark that we have real data to prevent future overwrites
        await this.setSettings({ ...settings, hasRealData: 'true' });
        // Mark that we have real data to prevent future overwrites
        await this.setSettings({ ...settings, hasRealData: 'true' });
      }
    } catch (error) {
      console.error('Error in initializeMockData:', error);
    }
  }

  // Separate method for creating mock data
  private async createMockData(): Promise<void> {
    try {
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

      // Initialize mock expenses
      const mockExpenses = [
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
      });

      // Set default settings without real data flag (will be set when user adds real data)
      await this.setSettings({
        fontSize: 'small',
        auth: 'false',
      console.log('IndexedDB: Default settings initialized');
    } catch (error) {
      console.error('Error during mock data initialization:', error);
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

    // Handle both old format (personId) and new format (userId) for expenses
    const processedExpenses = backup.expenses.map((expense: any) => ({
      ...expense,
      id: expense.id?.toString() || '',
      // Handle both personId (old format) and userId (new format)
      userId: (expense.userId || expense.personId)?.toString() || '',
      categoryId: expense.categoryId?.toString() || '',
      subcategoryId: expense.subcategoryId?.toString() || '',
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : (expense.amount || 0),
      // Ensure we have createdAt field (some old backups might not have it)
      createdAt: expense.createdAt || expense.updatedAt || new Date().toISOString()
    }));

    // Ensure all users have string IDs and handle missing fields
    const processedUsers = backup.users.map((user: any) => ({
      ...user,
      id: user.id?.toString() || '',
      username: user.username || user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user',
      email: user.email || `${user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@example.com`,
      // Ensure avatar exists
      avatar: user.avatar || user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
      // Ensure color exists
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

// Create singleton instance
export const indexedDBStorage = new IndexedDBStorage();