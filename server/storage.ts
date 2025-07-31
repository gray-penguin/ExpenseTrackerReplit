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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private subcategories: Map<number, Subcategory>;
  private expenses: Map<number, Expense>;
  private expenseAttachments: Map<number, ExpenseAttachment>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentSubcategoryId: number;
  private currentExpenseId: number;
  private currentAttachmentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.subcategories = new Map();
    this.expenses = new Map();
    this.expenseAttachments = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentSubcategoryId = 1;
    this.currentExpenseId = 1;
    this.currentAttachmentId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Initialize mock users
    const mockUsers = [
      {
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

    for (const user of mockUsers) {
      await this.createUser(user);
    }

    // Initialize mock categories
    const mockCategories = [
      { name: 'Groceries', icon: 'ShoppingCart', color: 'text-green-600' },
      { name: 'Utilities', icon: 'Zap', color: 'text-yellow-600' },
      { name: 'Entertainment', icon: 'Music', color: 'text-purple-600' },
      { name: 'Automobile', icon: 'Car', color: 'text-blue-600' }
    ];

    for (const category of mockCategories) {
      await this.createCategory(category);
    }

    // Initialize mock subcategories
    const mockSubcategories = [
      { name: 'Fresh Produce', categoryId: 1 },
      { name: 'Meat & Dairy', categoryId: 1 },
      { name: 'Pantry Items', categoryId: 1 },
      { name: 'Snacks & Beverages', categoryId: 1 },
      { name: 'Electricity', categoryId: 2 },
      { name: 'Water & Sewer', categoryId: 2 },
      { name: 'Internet & Cable', categoryId: 2 },
      { name: 'Gas', categoryId: 2 },
      { name: 'Movies & Shows', categoryId: 3 },
      { name: 'Gaming', categoryId: 3 },
      { name: 'Concerts & Events', categoryId: 3 },
      { name: 'Subscriptions', categoryId: 3 },
      { name: 'Fuel', categoryId: 4 },
      { name: 'Maintenance', categoryId: 4 },
      { name: 'Insurance', categoryId: 4 },
      { name: 'Parking & Tolls', categoryId: 4 }
    ];

    for (const subcategory of mockSubcategories) {
      await this.createSubcategory(subcategory);
    }

    // Initialize mock expenses to demonstrate functionality
    const mockExpenses = [
      {
        userId: 1,
        categoryId: 1,
        subcategoryId: 1,
        amount: '89.45',
        description: 'Weekly grocery shopping',
        notes: 'Bought fresh vegetables and meat for the week',
        storeName: 'Whole Foods Market',
        storeLocation: 'Downtown',
        date: '2025-01-18'
      },
      {
        userId: 1,
        categoryId: 4,
        subcategoryId: 13,
        amount: '45.00',
        description: 'Gas for car',
        notes: 'Filled up the tank',
        storeName: 'Shell Station',
        storeLocation: 'Main Street',
        date: '2025-01-17'
      },
      {
        userId: 2,
        categoryId: 2,
        subcategoryId: 5,
        amount: '125.50',
        description: 'Monthly electricity bill',
        notes: 'Higher than usual due to winter heating',
        storeName: 'City Electric',
        storeLocation: '',
        date: '2025-01-15'
      },
      {
        userId: 2,
        categoryId: 3,
        subcategoryId: 12,
        amount: '15.99',
        description: 'Netflix subscription',
        notes: 'Monthly streaming service',
        storeName: 'Netflix',
        storeLocation: 'Online',
        date: '2025-01-14'
      },
      {
        userId: 1,
        categoryId: 1,
        subcategoryId: 2,
        amount: '67.32',
        description: 'Lunch ingredients',
        notes: 'Bought items for meal prep',
        storeName: 'Trader Joes',
        storeLocation: 'Downtown',
        date: '2025-01-16'
      },
      {
        userId: 1,
        categoryId: 3,
        subcategoryId: 9,
        amount: '12.50',
        description: 'Movie tickets',
        notes: 'Watched the new action movie',
        storeName: 'AMC Theater',
        storeLocation: 'Downtown',
        date: '2025-01-19'
      },
      {
        userId: 2,
        categoryId: 4,
        subcategoryId: 15,
        amount: '95.00',
        description: 'Car insurance payment',
        notes: 'Monthly auto insurance',
        storeName: 'State Farm',
        storeLocation: 'Online',
        date: '2025-01-10'
      }
    ];

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
