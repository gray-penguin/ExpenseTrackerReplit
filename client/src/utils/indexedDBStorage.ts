import { User, Category, Expense } from '../types';
import { InstallationCodeManager } from './installationCode';

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

  async getAuthSettings(): Promise<any> {
    try {
      const store = await this.getKeyValueStore();
      return new Promise((resolve, reject) => {
        const request = store.get('authSettings');
        request.onsuccess = () => {
          resolve(request.result || {
            enabled: true
          });
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting auth settings from IndexedDB:', error);
      return {
        enabled: true
      };
    }
  }

  async setAuthSettings(authSettings: any): Promise<void> {
    try {
      const store = await this.getKeyValueStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(authSettings, 'authSettings');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error setting auth settings in IndexedDB:', error);
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
            useCase: 'personal-team'
          });
        } else {
          console.log('Preserving existing use case:', existingCredentials.useCase);
        }
      }
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }

  private async createMockData(): Promise<void> {
    // Set use case to personal-team for family
    await this.setCredentials({
      username: 'admin',
      password: 'pass123',
      email: 'admin@example.com',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      useCase: 'family-expenses'
    });

    // Jones family members
    const mockUsers = [
      {
        id: '1',
        name: 'David Jones',
        username: 'davidj',
        email: 'david.jones@family.com',
        avatar: 'DJ',
        color: 'bg-emerald-500',
        defaultCategoryId: '1',
        defaultSubcategoryId: '1',
        defaultStoreLocation: 'Neighborhood'
      },
      {
        id: '2',
        name: 'Lisa Jones',
        username: 'lisaj',
        email: 'lisa.jones@family.com',
        avatar: 'LJ',
        color: 'bg-blue-500',
        defaultCategoryId: '2',
        defaultSubcategoryId: '6',
        defaultStoreLocation: 'Local Stores'
      },
      {
        id: '3',
        name: 'Emma Jones',
        username: 'emmaj',
        email: 'emma.jones@family.com',
        avatar: 'EJ',
        color: 'bg-purple-500',
        defaultCategoryId: '3',
        defaultSubcategoryId: '11',
        defaultStoreLocation: 'School Area'
      },
      {
        id: '4',
        name: 'Michael Jones',
        username: 'mikej',
        email: 'michael.jones@family.com',
        avatar: 'MJ',
        color: 'bg-orange-500',
        defaultCategoryId: '3',
        defaultSubcategoryId: '12',
        defaultStoreLocation: 'Local'
      }
    ];

    // Family expense categories
    const mockCategories = [
      {
        id: '1',
        name: 'Utilities',
        icon: 'Zap',
        color: 'text-yellow-600',
        subcategories: [
          { id: '1', name: 'Electricity', categoryId: '1' },
          { id: '2', name: 'Water & Sewer', categoryId: '1' },
          { id: '3', name: 'Natural Gas', categoryId: '1' },
          { id: '4', name: 'Internet & Cable', categoryId: '1' },
          { id: '5', name: 'Phone & Mobile', categoryId: '1' }
        ]
      },
      {
        id: '2',
        name: 'Groceries',
        icon: 'ShoppingCart',
        color: 'text-green-600',
        subcategories: [
          { id: '6', name: 'Weekly Shopping', categoryId: '2' },
          { id: '7', name: 'Fresh Produce', categoryId: '2' },
          { id: '8', name: 'Meat & Dairy', categoryId: '2' },
          { id: '9', name: 'Household Items', categoryId: '2' },
          { id: '10', name: 'Snacks & Treats', categoryId: '2' }
        ]
      },
      {
        id: '3',
        name: 'Transportation',
        icon: 'Car',
        color: 'text-blue-600',
        subcategories: [
          { id: '11', name: 'Gasoline', categoryId: '3' },
          { id: '12', name: 'Car Maintenance', categoryId: '3' },
          { id: '13', name: 'Car Insurance', categoryId: '3' },
          { id: '14', name: 'Public Transit', categoryId: '3' },
          { id: '15', name: 'Parking & Tolls', categoryId: '3' }
        ]
      },
      {
        id: '4',
        name: 'Vacation',
        icon: 'Plane',
        color: 'text-purple-600',
        subcategories: [
          { id: '16', name: 'Flights & Travel', categoryId: '4' },
          { id: '17', name: 'Hotels & Lodging', categoryId: '4' },
          { id: '18', name: 'Dining Out', categoryId: '4' },
          { id: '19', name: 'Activities & Tours', categoryId: '4' },
          { id: '20', name: 'Souvenirs & Gifts', categoryId: '4' }
        ]
      },
      {
        id: '5',
        name: 'Home Improvements',
        icon: 'Home',
        color: 'text-orange-600',
        subcategories: [
          { id: '21', name: 'Tools & Hardware', categoryId: '5' },
          { id: '22', name: 'Paint & Supplies', categoryId: '5' },
          { id: '23', name: 'Appliances', categoryId: '5' },
          { id: '24', name: 'Furniture', categoryId: '5' },
          { id: '25', name: 'Professional Services', categoryId: '5' }
        ]
      }
    ];

    // Generate 500 Jones family expenses over 12 months
    const mockExpenses: any[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const expenseTemplates = [
      // Utilities expenses (monthly recurring)
      { categoryId: '1', subcategoryId: '1', descriptions: ['Monthly electricity bill', 'Electricity usage'], amounts: [120, 145, 98, 165], stores: ['Pacific Power', 'City Electric'], locations: ['Online', 'Online'] },
      { categoryId: '1', subcategoryId: '2', descriptions: ['Water and sewer bill', 'Monthly water service'], amounts: [65, 78, 55, 82], stores: ['City Water Department', 'Municipal Water'], locations: ['Online', 'Online'] },
      { categoryId: '1', subcategoryId: '3', descriptions: ['Natural gas bill', 'Heating and gas'], amounts: [85, 125, 45, 95], stores: ['Northwest Natural', 'Gas Company'], locations: ['Online', 'Online'] },
      { categoryId: '1', subcategoryId: '4', descriptions: ['Internet and cable', 'High-speed internet', 'Cable TV service'], amounts: [89.99, 95, 110], stores: ['Comcast', 'Verizon', 'AT&T'], locations: ['Online', 'Online', 'Online'] },
      { categoryId: '1', subcategoryId: '5', descriptions: ['Cell phone bill', 'Mobile service', 'Phone plan'], amounts: [125, 140, 95], stores: ['Verizon', 'T-Mobile', 'AT&T'], locations: ['Online', 'Online', 'Online'] },
      
      // Groceries expenses (weekly)
      { categoryId: '2', subcategoryId: '6', descriptions: ['Weekly grocery shopping', 'Family groceries', 'Food shopping'], amounts: [145, 165, 125, 185], stores: ['Safeway', 'Fred Meyer', 'Whole Foods', 'Costco'], locations: ['Neighborhood', 'Local', 'Downtown', 'Warehouse'] },
      { categoryId: '2', subcategoryId: '7', descriptions: ['Fresh fruits and vegetables', 'Organic produce', 'Farmers market'], amounts: [35, 45, 28, 52], stores: ['Farmers Market', 'Whole Foods', 'Local Market'], locations: ['Downtown', 'Neighborhood', 'Local'] },
      { categoryId: '2', subcategoryId: '8', descriptions: ['Meat and dairy products', 'Protein and dairy', 'Fresh meat'], amounts: [45, 65, 38, 72], stores: ['Butcher Shop', 'Safeway', 'Costco'], locations: ['Local', 'Neighborhood', 'Warehouse'] },
      { categoryId: '2', subcategoryId: '9', descriptions: ['Cleaning supplies', 'Household essentials', 'Paper products'], amounts: [25, 35, 18, 42], stores: ['Target', 'Costco', 'Dollar Store'], locations: ['Local', 'Warehouse', 'Neighborhood'] },
      { categoryId: '2', subcategoryId: '10', descriptions: ['Kids snacks', 'Family treats', 'Beverages'], amounts: [15, 25, 12, 35], stores: ['Target', 'Safeway', 'Corner Store'], locations: ['Local', 'Neighborhood', 'Local'] },
      
      // Transportation expenses
      { categoryId: '3', subcategoryId: '11', descriptions: ['Gas fill-up', 'Fuel for car', 'Gasoline'], amounts: [45, 55, 38, 62], stores: ['Shell', 'Chevron', 'Arco', '76 Station'], locations: ['Main Street', 'Highway', 'Neighborhood', 'Downtown'] },
      { categoryId: '3', subcategoryId: '12', descriptions: ['Oil change', 'Car maintenance', 'Tire rotation', 'Brake service'], amounts: [45, 285, 65, 450], stores: ['Jiffy Lube', 'Toyota Service', 'Discount Tire'], locations: ['Local', 'Dealership', 'Auto Center'] },
      { categoryId: '3', subcategoryId: '13', descriptions: ['Auto insurance premium', 'Car insurance'], amounts: [165, 175], stores: ['State Farm', 'Allstate'], locations: ['Online', 'Online'] },
      { categoryId: '3', subcategoryId: '14', descriptions: ['Bus fare', 'Light rail ticket', 'Public transit'], amounts: [3.25, 5.50, 2.75], stores: ['Metro Transit', 'Sound Transit'], locations: ['Transit Station', 'Train Station'] },
      { categoryId: '3', subcategoryId: '15', descriptions: ['Parking fee', 'Downtown parking', 'Airport parking'], amounts: [8, 12, 25, 45], stores: ['ParkWhiz', 'City Parking', 'Airport'], locations: ['Downtown', 'City Center', 'Airport'] },
      
      // Vacation expenses (seasonal)
      { categoryId: '4', subcategoryId: '16', descriptions: ['Flight tickets', 'Airline tickets', 'Air travel'], amounts: [450, 650, 325, 850], stores: ['Alaska Airlines', 'Southwest', 'Delta'], locations: ['Airport', 'Online', 'Online'] },
      { categoryId: '4', subcategoryId: '17', descriptions: ['Hotel stay', 'Vacation rental', 'Resort booking'], amounts: [185, 225, 145, 295], stores: ['Marriott', 'Airbnb', 'Holiday Inn'], locations: ['Destination', 'Vacation Spot', 'Resort'] },
      { categoryId: '4', subcategoryId: '18', descriptions: ['Restaurant dinner', 'Family dining', 'Vacation meals'], amounts: [65, 85, 45, 125], stores: ['Local Restaurant', 'Seaside Cafe', 'Family Diner'], locations: ['Vacation', 'Resort', 'Downtown'] },
      { categoryId: '4', subcategoryId: '19', descriptions: ['Theme park tickets', 'Museum admission', 'Tour booking'], amounts: [125, 85, 45, 195], stores: ['Disneyland', 'Local Museum', 'Tour Company'], locations: ['Theme Park', 'City', 'Tourist Area'] },
      { categoryId: '4', subcategoryId: '20', descriptions: ['Vacation souvenirs', 'Travel gifts', 'Postcards'], amounts: [25, 45, 15, 65], stores: ['Gift Shop', 'Souvenir Store', 'Local Market'], locations: ['Tourist Area', 'Vacation', 'Local'] },
      
      // Home Improvements expenses
      { categoryId: '5', subcategoryId: '21', descriptions: ['Drill and bits', 'Hammer set', 'Screwdriver kit', 'Power tools'], amounts: [85, 45, 25, 195], stores: ['Home Depot', 'Lowes', 'Harbor Freight'], locations: ['Hardware Store', 'Home Center', 'Tool Store'] },
      { categoryId: '5', subcategoryId: '22', descriptions: ['Interior paint', 'Exterior paint', 'Paint brushes', 'Primer'], amounts: [45, 65, 15, 35], stores: ['Sherwin Williams', 'Home Depot', 'Benjamin Moore'], locations: ['Paint Store', 'Hardware Store', 'Home Center'] },
      { categoryId: '5', subcategoryId: '23', descriptions: ['New refrigerator', 'Washing machine', 'Dishwasher repair'], amounts: [1250, 850, 185], stores: ['Best Buy', 'Sears', 'Appliance Repair'], locations: ['Electronics Store', 'Appliance Store', 'Home Service'] },
      { categoryId: '5', subcategoryId: '24', descriptions: ['Living room sofa', 'Dining table', 'Bedroom dresser'], amounts: [895, 650, 425], stores: ['IKEA', 'Ashley Furniture', 'Local Furniture'], locations: ['Furniture Store', 'Showroom', 'Local Store'] },
      { categoryId: '5', subcategoryId: '25', descriptions: ['Plumber service', 'Electrician work', 'Handyman repair'], amounts: [185, 295, 125], stores: ['Local Plumber', 'ABC Electric', 'Handyman Services'], locations: ['Home Service', 'Professional', 'Local Service'] }
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
        
        // Random family member (weighted towards parents for most expenses)
        let userId: string;
        const random = Math.random();
        if (random < 0.4) userId = '1'; // David - 40%
        else if (random < 0.7) userId = '2'; // Lisa - 30%
        else if (random < 0.85) userId = '3'; // Emma - 15%
        else userId = '4'; // Michael - 15%
        
        // Random expense template
        const templateIndex = Math.floor(Math.random() * expenseTemplates.length);
        const template = expenseTemplates[templateIndex];
        const itemIndex = Math.floor(Math.random() * template.descriptions.length);
        
        // Add some variation to amounts (±20%)
        const baseAmount = template.amounts[itemIndex];
        const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
        const finalAmount = Math.round((baseAmount * (1 + variation)) * 100) / 100;
        
        // Add occasional notes for variety
        let notes = undefined;
        if (Math.random() > 0.8) {
          const noteOptions = [
            'Family expense',
            'Needed for household',
            'Monthly recurring',
            'Shared family cost',
            'Essential purchase'
          ];
          notes = noteOptions[Math.floor(Math.random() * noteOptions.length)];
        }
        
        const expense = {
          id: expenseId.toString(),
          userId,
          categoryId: template.categoryId,
          subcategoryId: template.subcategoryId,
          amount: finalAmount,
          description: template.descriptions[itemIndex],
          notes,
          storeName: template.stores[itemIndex],
          storeLocation: template.locations[itemIndex],
          date: dateString,
          createdAt: expenseDate.toISOString()
        };
        
        mockExpenses.push(expense);
        expenseId++;
      }
    }
    
    // Add recent expenses to reach exactly 500
    while (mockExpenses.length < 500) {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));
      const dateString = recentDate.toISOString().split('T')[0];
      
      // Random family member
      let userId: string;
      const random = Math.random();
      if (random < 0.4) userId = '1'; // David - 40%
      else if (random < 0.7) userId = '2'; // Lisa - 30%
      else if (random < 0.85) userId = '3'; // Emma - 15%
      else userId = '4'; // Michael - 15%
      
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
        notes: Math.random() > 0.8 ? 'Recent family expense' : undefined,
        storeName: template.stores[itemIndex],
        storeLocation: template.locations[itemIndex],
        date: dateString,
        createdAt: recentDate.toISOString()
      };
      
      mockExpenses.push(expense);
      expenseId++;
    }

    console.log(`Generated ${mockExpenses.length} Jones family expenses over 12 months`);

    await Promise.all([
      this.setUsers(mockUsers),
      this.setCategories(mockCategories),
      this.setExpenses(mockExpenses)
    ]);
  }

  async createFullBackup(): Promise<BackupData> {
    console.log('IndexedDBStorage.createFullBackup called');
    try {
      const [users, categories, expenses, credentials, settings, installationInfo] = await Promise.all([
        this.getUsers(),
        this.getCategories(),
        this.getExpenses(),
        this.getCredentials(),
        this.getSettings(),
        InstallationCodeManager.getInstallationInfo()
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
        installationCode: installationInfo.code,
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