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

// Simple localStorage-based storage that was working before
export class IndexedDBStorage {
  private static readonly STORAGE_KEYS = {
    users: 'expense-tracker-users',
    categories: 'expense-tracker-categories',
    expenses: 'expense-tracker-expenses',
    credentials: 'expense-tracker-credentials',
    settings: 'expense-tracker-settings',
    initialized: 'expense-tracker-initialized'
  };

  async init(): Promise<void> {
    // Simple initialization - just ensure localStorage is available
    if (typeof localStorage === 'undefined') {
      throw new Error('localStorage is not available');
    }
  }

  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  private setToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }

  async getUsers(): Promise<User[]> {
    return this.getFromStorage(IndexedDBStorage.STORAGE_KEYS.users, []);
  }

  async setUsers(users: User[]): Promise<void> {
    this.setToStorage(IndexedDBStorage.STORAGE_KEYS.users, users);
  }

  async getCategories(): Promise<Category[]> {
    return this.getFromStorage(IndexedDBStorage.STORAGE_KEYS.categories, []);
  }

  async setCategories(categories: Category[]): Promise<void> {
    this.setToStorage(IndexedDBStorage.STORAGE_KEYS.categories, categories);
  }

  async getExpenses(): Promise<Expense[]> {
    return this.getFromStorage(IndexedDBStorage.STORAGE_KEYS.expenses, []);
  }

  async setExpenses(expenses: Expense[]): Promise<void> {
    this.setToStorage(IndexedDBStorage.STORAGE_KEYS.expenses, expenses);
  }

  async getCredentials(): Promise<any> {
    return this.getFromStorage(IndexedDBStorage.STORAGE_KEYS.credentials, {
      username: 'admin',
      password: 'pass123',
      email: 'admin@example.com',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      useCase: 'personal-team'
    });
  }

  async setCredentials(credentials: any): Promise<void> {
    this.setToStorage(IndexedDBStorage.STORAGE_KEYS.credentials, credentials);
  }

  async getSettings(): Promise<any> {
    return this.getFromStorage(IndexedDBStorage.STORAGE_KEYS.settings, {
      fontSize: 'small',
      auth: 'false'
    });
  }

  async setSettings(settings: any): Promise<void> {
    this.setToStorage(IndexedDBStorage.STORAGE_KEYS.settings, settings);
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
    // Check if already initialized
    const isInitialized = localStorage.getItem(IndexedDBStorage.STORAGE_KEYS.initialized);
    if (isInitialized) {
      return;
    }

    const users = await this.getUsers();
    if (users.length === 0) {
      console.log('Initializing with mock data');
      await this.createMockData();
      localStorage.setItem(IndexedDBStorage.STORAGE_KEYS.initialized, 'true');
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

  async createFullBackup(): Promise<BackupData> {
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