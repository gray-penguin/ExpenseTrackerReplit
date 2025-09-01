import { 
  users, categories, subcategories, expenses, expenseAttachments,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Subcategory, type InsertSubcategory,
  type Expense, type InsertExpense,
  type ExpenseAttachment, type InsertExpenseAttachment
} from "@shared/schema";
import { mockUsers } from "../client/src/data/mockUsers";
import { mockCategories } from "../client/src/data/mockCategories";
import { MockExpenseGenerator } from "../client/src/data/mockExpenseGenerator";

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
    // Convert mock data to server format
    const serverUsers = mockUsers.map((user, index) => ({
      username: user.username,
      email: user.email,
      fullName: user.name
    }));

    // Generate mock expenses using the generator
    const mockExpensesData = MockExpenseGenerator.generate({
      numberOfExpenses: 500,
      userIds: [1, 2, 3, 4]
    });

    // Convert to server format
    const serverExpenses = mockExpensesData.map(expense => ({
      userId: parseInt(expense.userId),
      categoryId: parseInt(expense.categoryId),
      subcategoryId: parseInt(expense.subcategoryId),
      amount: expense.amount.toString(),
      description: expense.description,
      notes: expense.notes,
      storeName: expense.storeName,
      storeLocation: expense.storeLocation,
      date: expense.date
    }));

    for (const user of serverUsers) {
      await this.createUser(user);
    }

    // Convert categories to server format
    const serverCategories = mockCategories.map(category => ({
      name: category.name,
      icon: category.icon,
      color: category.color
    }));

    for (const category of serverCategories) {
      await this.createCategory(category);
    }

    // Convert subcategories to server format
    const serverSubcategories = mockCategories.flatMap((category, categoryIndex) =>
      category.subcategories.map(subcategory => ({
        name: subcategory.name,
        categoryId: categoryIndex + 1
      }))
    );

    for (const subcategory of serverSubcategories) {
      await this.createSubcategory(subcategory);
    }

    for (const expense of serverExpenses) {
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