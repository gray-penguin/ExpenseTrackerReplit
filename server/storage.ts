import { 
  users, categories, subcategories, expenses, expenseAttachments,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Subcategory, type InsertSubcategory,
  type Expense, type InsertExpense,
  type ExpenseAttachment, type InsertExpenseAttachment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Subcategory methods
  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategory(id: number): Promise<Subcategory | undefined>;
  getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;
  updateSubcategory(id: number, subcategory: Partial<InsertSubcategory>): Promise<Subcategory | undefined>;
  deleteSubcategory(id: number): Promise<boolean>;

  // Expense methods
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  getExpensesByUser(userId: string): Promise<Expense[]>;
  getExpensesByCategory(categoryId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Expense attachment methods
  getExpenseAttachment(id: number): Promise<ExpenseAttachment | undefined>;
  createExpenseAttachment(attachment: InsertExpenseAttachment): Promise<ExpenseAttachment>;
  deleteExpenseAttachment(id: number): Promise<boolean>;
}

class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private categories = new Map<number, Category>();
  private subcategories = new Map<number, Subcategory>();
  private expenses = new Map<number, Expense>();
  private expenseAttachments = new Map<number, ExpenseAttachment>();

  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentSubcategoryId = 1;
  private currentExpenseId = 1;
  private currentAttachmentId = 1;

  constructor() {
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Initialize Jones family members
    const mockUsers = [
      { username: 'david_jones', email: 'david@jones-family.com', fullName: 'David Jones' },
      { username: 'lisa_jones', email: 'lisa@jones-family.com', fullName: 'Lisa Jones' },
      { username: 'emma_jones', email: 'emma@jones-family.com', fullName: 'Emma Jones' },
      { username: 'michael_jones', email: 'michael@jones-family.com', fullName: 'Michael Jones' }
    ];

    // Generate 500 Jones family expenses over 12 months
    const mockExpenses: any[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    const expenseTemplates = [
      // Utilities expenses (monthly recurring)
      { categoryId: 1, subcategoryId: 1, descriptions: ['Monthly electricity bill', 'Electricity usage'], amounts: [120, 145, 98, 165], stores: ['Pacific Power', 'City Electric'], locations: ['Online', 'Online'] },
      { categoryId: 1, subcategoryId: 2, descriptions: ['Water and sewer bill', 'Monthly water service'], amounts: [65, 78, 55, 82], stores: ['City Water Department', 'Municipal Water'], locations: ['Online', 'Online'] },
      { categoryId: 1, subcategoryId: 3, descriptions: ['Natural gas bill', 'Heating and gas'], amounts: [85, 125, 45, 95], stores: ['Northwest Natural', 'Gas Company'], locations: ['Online', 'Online'] },
      { categoryId: 1, subcategoryId: 4, descriptions: ['Internet and cable', 'High-speed internet', 'Cable TV service'], amounts: [89.99, 95, 110], stores: ['Comcast', 'Verizon', 'AT&T'], locations: ['Online', 'Online', 'Online'] },
      { categoryId: 1, subcategoryId: 5, descriptions: ['Cell phone bill', 'Mobile service', 'Phone plan'], amounts: [125, 140, 95], stores: ['Verizon', 'T-Mobile', 'AT&T'], locations: ['Online', 'Online', 'Online'] },
      
      // Groceries expenses (weekly)
      { categoryId: 2, subcategoryId: 6, descriptions: ['Weekly grocery shopping', 'Family groceries', 'Food shopping'], amounts: [145, 165, 125, 185], stores: ['Safeway', 'Fred Meyer', 'Whole Foods', 'Costco'], locations: ['Neighborhood', 'Local', 'Downtown', 'Warehouse'] },
      { categoryId: 2, subcategoryId: 7, descriptions: ['Fresh fruits and vegetables', 'Organic produce', 'Farmers market'], amounts: [35, 45, 28, 52], stores: ['Farmers Market', 'Whole Foods', 'Local Market'], locations: ['Downtown', 'Neighborhood', 'Local'] },
      { categoryId: 2, subcategoryId: 8, descriptions: ['Meat and dairy products', 'Protein and dairy', 'Fresh meat'], amounts: [45, 65, 38, 72], stores: ['Butcher Shop', 'Safeway', 'Costco'], locations: ['Local', 'Neighborhood', 'Warehouse'] },
      { categoryId: 2, subcategoryId: 9, descriptions: ['Cleaning supplies', 'Household essentials', 'Paper products'], amounts: [25, 35, 18, 42], stores: ['Target', 'Costco', 'Dollar Store'], locations: ['Local', 'Warehouse', 'Neighborhood'] },
      { categoryId: 2, subcategoryId: 10, descriptions: ['Kids snacks', 'Family treats', 'Beverages'], amounts: [15, 25, 12, 35], stores: ['Target', 'Safeway', 'Corner Store'], locations: ['Local', 'Neighborhood', 'Local'] },
      
      // Transportation expenses
      { categoryId: 3, subcategoryId: 11, descriptions: ['Gas fill-up', 'Fuel for car', 'Gasoline'], amounts: [45, 55, 38, 62], stores: ['Shell', 'Chevron', 'Arco', '76 Station'], locations: ['Main Street', 'Highway', 'Neighborhood', 'Downtown'] },
      { categoryId: 3, subcategoryId: 12, descriptions: ['Oil change', 'Car maintenance', 'Tire rotation', 'Brake service'], amounts: [45, 285, 65, 450], stores: ['Jiffy Lube', 'Toyota Service', 'Discount Tire'], locations: ['Local', 'Dealership', 'Auto Center'] },
      { categoryId: 3, subcategoryId: 13, descriptions: ['Auto insurance premium', 'Car insurance'], amounts: [165, 175], stores: ['State Farm', 'Allstate'], locations: ['Online', 'Online'] },
      { categoryId: 3, subcategoryId: 14, descriptions: ['Bus fare', 'Light rail ticket', 'Public transit'], amounts: [3.25, 5.50, 2.75], stores: ['Metro Transit', 'Sound Transit'], locations: ['Transit Station', 'Train Station'] },
      { categoryId: 3, subcategoryId: 15, descriptions: ['Parking fee', 'Downtown parking', 'Airport parking'], amounts: [8, 12, 25, 45], stores: ['ParkWhiz', 'City Parking', 'Airport'], locations: ['Downtown', 'City Center', 'Airport'] },
      
      // Vacation expenses (seasonal)
      { categoryId: 4, subcategoryId: 16, descriptions: ['Flight tickets', 'Airline tickets', 'Air travel'], amounts: [450, 650, 325, 850], stores: ['Alaska Airlines', 'Southwest', 'Delta'], locations: ['Airport', 'Online', 'Online'] },
      { categoryId: 4, subcategoryId: 17, descriptions: ['Hotel stay', 'Vacation rental', 'Resort booking'], amounts: [185, 225, 145, 295], stores: ['Marriott', 'Airbnb', 'Holiday Inn'], locations: ['Destination', 'Vacation Spot', 'Resort'] },
      { categoryId: 4, subcategoryId: 18, descriptions: ['Restaurant dinner', 'Family dining', 'Vacation meals'], amounts: [65, 85, 45, 125], stores: ['Local Restaurant', 'Seaside Cafe', 'Family Diner'], locations: ['Vacation', 'Resort', 'Downtown'] },
      { categoryId: 4, subcategoryId: 19, descriptions: ['Theme park tickets', 'Museum admission', 'Tour booking'], amounts: [125, 85, 45, 195], stores: ['Disneyland', 'Local Museum', 'Tour Company'], locations: ['Theme Park', 'City', 'Tourist Area'] },
      { categoryId: 4, subcategoryId: 20, descriptions: ['Vacation souvenirs', 'Travel gifts', 'Postcards'], amounts: [25, 45, 15, 65], stores: ['Gift Shop', 'Souvenir Store', 'Local Market'], locations: ['Tourist Area', 'Vacation', 'Local'] },
      
      // Home Improvements expenses
      { categoryId: 5, subcategoryId: 21, descriptions: ['Drill and bits', 'Hammer set', 'Screwdriver kit', 'Power tools'], amounts: [85, 45, 25, 195], stores: ['Home Depot', 'Lowes', 'Harbor Freight'], locations: ['Hardware Store', 'Home Center', 'Tool Store'] },
      { categoryId: 5, subcategoryId: 22, descriptions: ['Interior paint', 'Exterior paint', 'Paint brushes', 'Primer'], amounts: [45, 65, 15, 35], stores: ['Sherwin Williams', 'Home Depot', 'Benjamin Moore'], locations: ['Paint Store', 'Hardware Store', 'Home Center'] },
      { categoryId: 5, subcategoryId: 23, descriptions: ['New refrigerator', 'Washing machine', 'Dishwasher repair'], amounts: [1250, 850, 185], stores: ['Best Buy', 'Sears', 'Appliance Repair'], locations: ['Electronics Store', 'Appliance Store', 'Home Service'] },
      { categoryId: 5, subcategoryId: 24, descriptions: ['Living room sofa', 'Dining table', 'Bedroom dresser'], amounts: [895, 650, 425], stores: ['IKEA', 'Ashley Furniture', 'Local Furniture'], locations: ['Furniture Store', 'Showroom', 'Local Store'] },
      { categoryId: 5, subcategoryId: 25, descriptions: ['Plumber service', 'Electrician work', 'Handyman repair'], amounts: [185, 295, 125], stores: ['Local Plumber', 'ABC Electric', 'Handyman Services'], locations: ['Home Service', 'Professional', 'Local Service'] }
    ];

    // Generate 500 Jones family expenses over 12 months
    let expenseId = 1;
    
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
        let userId: number;
        const random = Math.random();
        if (random < 0.4) userId = 1; // David - 40%
        else if (random < 0.7) userId = 2; // Lisa - 30%
        else if (random < 0.85) userId = 3; // Emma - 15%
        else userId = 4; // Michael - 15%
        
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
          userId,
          categoryId: template.categoryId,
          subcategoryId: template.subcategoryId,
          amount: finalAmount.toString(),
          description: template.descriptions[itemIndex],
          notes,
          storeName: template.stores[itemIndex],
          storeLocation: template.locations[itemIndex],
          date: dateString
        };
        
        mockExpenses.push(expense);
        expenseId++;
      }
    }
    
    console.log(`Generated ${mockExpenses.length} Jones family expenses over 12 months`);

    for (const user of mockUsers) {
      await this.createUser(user);
    }

    // Initialize family expense categories
    const mockCategories = [
      { name: 'Utilities', icon: 'Zap', color: 'text-yellow-600' },
      { name: 'Groceries', icon: 'ShoppingCart', color: 'text-green-600' },
      { name: 'Transportation', icon: 'Car', color: 'text-blue-600' },
      { name: 'Vacation', icon: 'Plane', color: 'text-purple-600' },
      { name: 'Home Improvements', icon: 'Home', color: 'text-orange-600' }
    ];

    for (const category of mockCategories) {
      await this.createCategory(category);
    }

    // Initialize family subcategories
    const mockSubcategories = [
      // Utilities (categoryId: 1)
      { name: 'Electricity', categoryId: 1 },
      { name: 'Water & Sewer', categoryId: 1 },
      { name: 'Natural Gas', categoryId: 1 },
      { name: 'Internet & Cable', categoryId: 1 },
      { name: 'Phone & Mobile', categoryId: 1 },
      // Groceries (categoryId: 2)
      { name: 'Weekly Shopping', categoryId: 2 },
      { name: 'Fresh Produce', categoryId: 2 },
      { name: 'Meat & Dairy', categoryId: 2 },
      { name: 'Household Items', categoryId: 2 },
      { name: 'Snacks & Treats', categoryId: 2 },
      // Transportation (categoryId: 3)
      { name: 'Gasoline', categoryId: 3 },
      { name: 'Car Maintenance', categoryId: 3 },
      { name: 'Car Insurance', categoryId: 3 },
      { name: 'Public Transit', categoryId: 3 },
      { name: 'Parking & Tolls', categoryId: 3 },
      // Vacation (categoryId: 4)
      { name: 'Flights & Travel', categoryId: 4 },
      { name: 'Hotels & Lodging', categoryId: 4 },
      { name: 'Dining Out', categoryId: 4 },
      { name: 'Activities & Tours', categoryId: 4 },
      { name: 'Souvenirs & Gifts', categoryId: 4 },
      // Home Improvements (categoryId: 5)
      { name: 'Tools & Hardware', categoryId: 5 },
      { name: 'Paint & Supplies', categoryId: 5 },
      { name: 'Appliances', categoryId: 5 },
      { name: 'Furniture', categoryId: 5 },
      { name: 'Professional Services', categoryId: 5 }
    ];

    for (const subcategory of mockSubcategories) {
      await this.createSubcategory(subcategory);
    }

    for (const expense of mockExpenses) {
      await this.createExpense(expense);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Subcategory methods
  async getAllSubcategories(): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values());
  }

  async getSubcategory(id: number): Promise<Subcategory | undefined> {
    return this.subcategories.get(id);
  }

  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values()).filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
  }

  async createSubcategory(insertSubcategory: InsertSubcategory): Promise<Subcategory> {
    const id = this.currentSubcategoryId++;
    const subcategory: Subcategory = { ...insertSubcategory, id };
    this.subcategories.set(id, subcategory);
    return subcategory;
  }

  async updateSubcategory(id: number, updateData: Partial<InsertSubcategory>): Promise<Subcategory | undefined> {
    const subcategory = this.subcategories.get(id);
    if (!subcategory) return undefined;
    
    const updatedSubcategory = { ...subcategory, ...updateData };
    this.subcategories.set(id, updatedSubcategory);
    return updatedSubcategory;
  }

  async deleteSubcategory(id: number): Promise<boolean> {
    return this.subcategories.delete(id);
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByUser(userId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }

  async getExpensesByCategory(categoryId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.categoryId === categoryId
    );
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = { 
      ...insertExpense, 
      id,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updateData };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Expense attachment methods
  async getExpenseAttachment(id: number): Promise<ExpenseAttachment | undefined> {
    return this.expenseAttachments.get(id);
  }

  async createExpenseAttachment(insertAttachment: InsertExpenseAttachment): Promise<ExpenseAttachment> {
    const id = this.currentAttachmentId++;
    const attachment: ExpenseAttachment = { 
      ...insertAttachment, 
      id,
      uploadedAt: new Date()
    };
    this.expenseAttachments.set(id, attachment);
    return attachment;
  }

  async deleteExpenseAttachment(id: number): Promise<boolean> {
    return this.expenseAttachments.delete(id);
  }
}

export const storage = new MemStorage();
