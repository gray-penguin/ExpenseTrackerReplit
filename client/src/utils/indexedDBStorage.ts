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
      // Always reinitialize to apply the new project-based data
      console.log('Initializing with new project-based mock data');

      await this.createMockData();
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  private async createMockData(): Promise<void> {
    // Set use case to project-based
    await this.setCredentials({
      username: 'admin',
      password: 'pass123',
      email: 'admin@example.com',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      useCase: 'project-based'
    });

    // 3 Projects (replacing users)
    const mockUsers = [
      {
        id: '1',
        name: 'Website Redesign',
        username: 'web-redesign',
        email: 'web-redesign@company.com',
        avatar: 'WR',
        color: 'bg-blue-500',
        defaultCategoryId: '1',
        defaultSubcategoryId: '1',
        defaultStoreLocation: 'Remote'
      },
      {
        id: '2',
        name: 'Mobile App Development',
        username: 'mobile-app',
        email: 'mobile-app@company.com',
        avatar: 'MA',
        color: 'bg-purple-500',
        defaultCategoryId: '2',
        defaultSubcategoryId: '6',
        defaultStoreLocation: 'Office'
      },
      {
        id: '3',
        name: 'Marketing Campaign Q1',
        username: 'marketing-q1',
        email: 'marketing-q1@company.com',
        avatar: 'MQ',
        color: 'bg-orange-500',
        defaultCategoryId: '3',
        defaultSubcategoryId: '11',
        defaultStoreLocation: 'Various'
      }
    ];

    // 3 Categories with 5 subcategories each
    const mockCategories = [
      {
        id: '1',
        name: 'Development & Technology',
        icon: 'Code',
        color: 'text-blue-600',
        subcategories: [
          { id: '1', name: 'Software Licenses', categoryId: '1' },
          { id: '2', name: 'Cloud Services', categoryId: '1' },
          { id: '3', name: 'Development Tools', categoryId: '1' },
          { id: '4', name: 'API Services', categoryId: '1' },
          { id: '5', name: 'Hosting & Domains', categoryId: '1' }
        ]
      },
      {
        id: '2',
        name: 'Operations & Equipment',
        icon: 'Settings',
        color: 'text-green-600',
        subcategories: [
          { id: '6', name: 'Hardware & Equipment', categoryId: '2' },
          { id: '7', name: 'Office Supplies', categoryId: '2' },
          { id: '8', name: 'Communication Tools', categoryId: '2' },
          { id: '9', name: 'Project Management', categoryId: '2' },
          { id: '10', name: 'Security & Backup', categoryId: '2' }
        ]
      },
      {
        id: '3',
        name: 'Marketing & Outreach',
        icon: 'Megaphone',
        color: 'text-purple-600',
        subcategories: [
          { id: '11', name: 'Advertising & Ads', categoryId: '3' },
          { id: '12', name: 'Content Creation', categoryId: '3' },
          { id: '13', name: 'Social Media Tools', categoryId: '3' },
          { id: '14', name: 'Analytics & Tracking', categoryId: '3' },
          { id: '15', name: 'Events & Conferences', categoryId: '3' }
        ]
      }
    ];

    // Generate 500 expenses spread over 12 months starting a year ago
    const mockExpenses: any[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const expenseTemplates = [
      // Development & Technology expenses
      { categoryId: '1', subcategoryId: '1', descriptions: ['GitHub Pro subscription', 'JetBrains license', 'Adobe Creative Suite', 'Figma Pro plan'], amounts: [20, 199, 52.99, 15], stores: ['GitHub', 'JetBrains', 'Adobe', 'Figma'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '1', subcategoryId: '2', descriptions: ['AWS hosting costs', 'Google Cloud storage', 'Vercel Pro plan', 'MongoDB Atlas'], amounts: [89.50, 45.20, 20, 57.30], stores: ['Amazon Web Services', 'Google Cloud', 'Vercel', 'MongoDB'], locations: ['Cloud', 'Cloud', 'Cloud', 'Cloud'] },
      { categoryId: '1', subcategoryId: '3', descriptions: ['VS Code extensions', 'Postman Pro', 'Docker Desktop', 'Slack workspace'], amounts: [15, 19, 5, 8.33], stores: ['Microsoft', 'Postman', 'Docker', 'Slack'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '1', subcategoryId: '4', descriptions: ['Stripe API fees', 'SendGrid email service', 'Twilio SMS credits', 'Google Maps API'], amounts: [25.40, 19.95, 30, 15.75], stores: ['Stripe', 'SendGrid', 'Twilio', 'Google'], locations: ['API', 'API', 'API', 'API'] },
      { categoryId: '1', subcategoryId: '5', descriptions: ['Domain renewal', 'SSL certificate', 'CDN service', 'Backup storage'], amounts: [12.99, 89, 25, 9.99], stores: ['Namecheap', 'DigiCert', 'Cloudflare', 'Backblaze'], locations: ['Online', 'Online', 'Online', 'Online'] },
      
      // Operations & Equipment expenses
      { categoryId: '2', subcategoryId: '6', descriptions: ['MacBook Pro', 'External monitor', 'Wireless keyboard', 'USB-C hub'], amounts: [2499, 399, 129, 79.99], stores: ['Apple Store', 'Dell', 'Logitech', 'Anker'], locations: ['Store', 'Online', 'Best Buy', 'Amazon'] },
      { categoryId: '2', subcategoryId: '7', descriptions: ['Printer paper', 'Sticky notes', 'Pens and markers', 'Notebooks'], amounts: [25.99, 8.50, 15.75, 22.40], stores: ['Staples', 'Office Depot', 'Target', 'Moleskine'], locations: ['Store', 'Store', 'Store', 'Online'] },
      { categoryId: '2', subcategoryId: '8', descriptions: ['Zoom Pro subscription', 'Microsoft Teams', 'Slack premium', 'Discord Nitro'], amounts: [14.99, 12.50, 8.33, 9.99], stores: ['Zoom', 'Microsoft', 'Slack', 'Discord'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '2', subcategoryId: '9', descriptions: ['Asana premium', 'Trello Power-Ups', 'Notion Pro', 'Linear subscription'], amounts: [24.99, 10, 16, 20], stores: ['Asana', 'Trello', 'Notion', 'Linear'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '2', subcategoryId: '10', descriptions: ['1Password team', 'LastPass business', 'Backup software', 'VPN service'], amounts: [7.99, 6, 49.99, 11.95], stores: ['1Password', 'LastPass', 'Acronis', 'NordVPN'], locations: ['Online', 'Online', 'Online', 'Online'] },
      
      // Marketing & Outreach expenses
      { categoryId: '3', subcategoryId: '11', descriptions: ['Google Ads campaign', 'Facebook advertising', 'LinkedIn promoted posts', 'Twitter ads'], amounts: [250, 180, 95, 75], stores: ['Google Ads', 'Meta Business', 'LinkedIn', 'Twitter'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '3', subcategoryId: '12', descriptions: ['Stock photography', 'Video editing software', 'Graphic design tools', 'Content writing'], amounts: [29.99, 52.99, 19.99, 150], stores: ['Shutterstock', 'Adobe', 'Canva', 'Upwork'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '3', subcategoryId: '13', descriptions: ['Buffer Pro plan', 'Hootsuite subscription', 'Later premium', 'Sprout Social'], amounts: [15, 49, 25, 89], stores: ['Buffer', 'Hootsuite', 'Later', 'Sprout Social'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '3', subcategoryId: '14', descriptions: ['Google Analytics 360', 'Mixpanel subscription', 'Hotjar insights', 'Amplitude analytics'], amounts: [150, 89, 39, 61], stores: ['Google', 'Mixpanel', 'Hotjar', 'Amplitude'], locations: ['Online', 'Online', 'Online', 'Online'] },
      { categoryId: '3', subcategoryId: '15', descriptions: ['Conference tickets', 'Trade show booth', 'Networking event', 'Workshop attendance'], amounts: [299, 1200, 85, 199], stores: ['TechCrunch Disrupt', 'CES Expo', 'Local Chamber', 'Design Workshop'], locations: ['San Francisco', 'Las Vegas', 'Downtown', 'Seattle'] }
    ];
    
    let expenseId = 1;
    
    // Generate 500 expenses over 12 months
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + month);
      
      // Generate 40-45 expenses per month (roughly 500 total)
      const expensesThisMonth = Math.floor(Math.random() * 6) + 40; // 40-45 expenses
      
      for (let i = 0; i < expensesThisMonth && expenseId <= 500; i++) {
        // Random day in the month
        const day = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid month-end issues
        const expenseDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const dateString = expenseDate.toISOString().split('T')[0];
        
        // Random project (user)
        const projectIndex = Math.floor(Math.random() * 3);
        const userId = (projectIndex + 1).toString();
        
        // Random expense template
        const templateIndex = Math.floor(Math.random() * expenseTemplates.length);
        const template = expenseTemplates[templateIndex];
        const itemIndex = Math.floor(Math.random() * template.descriptions.length);
        
        // Add some variation to amounts (±20%)
        const baseAmount = template.amounts[itemIndex];
        const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
        const finalAmount = Math.round((baseAmount * (1 + variation)) * 100) / 100;
        
        const expense = {
          id: expenseId.toString(),
          userId,
          categoryId: template.categoryId,
          subcategoryId: template.subcategoryId,
          amount: finalAmount,
          description: template.descriptions[itemIndex],
          notes: Math.random() > 0.7 ? `Project expense for ${mockUsers[projectIndex].name}` : undefined,
          storeName: template.stores[itemIndex],
          storeLocation: template.locations[itemIndex],
          date: dateString,
          createdAt: expenseDate.toISOString()
        };
        
        mockExpenses.push(expense);
        expenseId++;
      }
    }
    
    // Add a few more recent expenses to reach closer to 500
    while (mockExpenses.length < 500) {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));
      const dateString = recentDate.toISOString().split('T')[0];
      
      const projectIndex = Math.floor(Math.random() * 3);
      const userId = (projectIndex + 1).toString();
      const templateIndex = Math.floor(Math.random() * expenseTemplates.length);
      const template = expenseTemplates[templateIndex];
      const itemIndex = Math.floor(Math.random() * template.descriptions.length);
      
      const baseAmount = template.amounts[itemIndex];
      const variation = (Math.random() - 0.5) * 0.4;
      const finalAmount = Math.round((baseAmount * (1 + variation)) * 100) / 100;
      
      const expense = {
        id: expenseId.toString(),
        userId,
        categoryId: template.categoryId,
        subcategoryId: template.subcategoryId,
        amount: finalAmount,
        description: template.descriptions[itemIndex],
        notes: Math.random() > 0.8 ? `Recent project expense for ${mockUsers[projectIndex].name}` : undefined,
        storeName: template.stores[itemIndex],
        storeLocation: template.locations[itemIndex],
        date: dateString,
        createdAt: recentDate.toISOString()
      };
      
      mockExpenses.push(expense);
      expenseId++;
    }

    console.log(`Generated ${mockExpenses.length} project expenses over 12 months`);

    await Promise.all([
      this.setUsers(mockUsers),
      this.setCategories(mockCategories),
      this.setExpenses(mockExpenses)
    ]);
  }

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
    console.log('IndexedDBStorage.createFullBackup called');
    try {
      const [users, categories, expenses, credentials, settings] = await Promise.all([
        this.getUsers(),
        this.getCategories(),
        this.getExpenses(),
        this.getCredentials(),
        this.getSettings()
      ]);

      console.log('Retrieved data for backup:', { 
        usersCount: users.length, 
        categoriesCount: categories.length, 
        expensesCount: expenses.length,
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
        users,
        categories: flatCategories,
        subcategories: flatSubcategories,
        expenses,
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