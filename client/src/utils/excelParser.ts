import * as XLSX from 'xlsx';
import { User, Category, Expense } from '../types';

export interface ExcelParseResult {
  success: boolean;
  data?: {
    users: User[];
    categories: Category[];
    expenses: Expense[];
  };
  errors: string[];
  warnings: string[];
}

export interface ExcelSheetData {
  users: any[];
  categories: any[];
  subcategories: any[];
  expenses: any[];
}

export class ExcelParser {
  private static readonly REQUIRED_SHEETS = ['users', 'categories', 'subcategories', 'expenses'];
  private static readonly SHEET_ALIASES = {
    users: ['users', 'user', 'people', 'team', 'members'],
    categories: ['categories', 'category', 'cats'],
    subcategories: ['subcategories', 'subcategory', 'subs', 'sub_categories'],
    expenses: ['expenses', 'expense', 'transactions', 'spending']
  };

  static async parseExcelFile(file: File): Promise<ExcelParseResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get sheet data
      const sheetData = this.extractSheetData(workbook, errors, warnings);
      
      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      // Validate and convert data
      const validationResult = this.validateAndConvertData(sheetData, errors, warnings);
      
      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      return {
        success: true,
        data: validationResult,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  private static extractSheetData(workbook: XLSX.WorkBook, errors: string[], warnings: string[]): ExcelSheetData {
    const sheetData: ExcelSheetData = {
      users: [],
      categories: [],
      subcategories: [],
      expenses: []
    };

    const sheetNames = workbook.SheetNames.map(name => name.toLowerCase());
    
    // Find sheets by name or alias
    for (const [dataType, aliases] of Object.entries(this.SHEET_ALIASES)) {
      let foundSheet = false;
      
      for (const alias of aliases) {
        const sheetIndex = sheetNames.findIndex(name => name === alias);
        if (sheetIndex !== -1) {
          const actualSheetName = workbook.SheetNames[sheetIndex];
          const worksheet = workbook.Sheets[actualSheetName];
          
          try {
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const processedData = this.processSheetData(jsonData, dataType as keyof ExcelSheetData);
            sheetData[dataType as keyof ExcelSheetData] = processedData;
            foundSheet = true;
            break;
          } catch (error) {
            errors.push(`Error reading sheet "${actualSheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (!foundSheet) {
        if (dataType === 'users' || dataType === 'categories' || dataType === 'expenses') {
          errors.push(`Required sheet "${dataType}" not found. Expected one of: ${aliases.join(', ')}`);
        } else {
          warnings.push(`Optional sheet "${dataType}" not found. Expected one of: ${aliases.join(', ')}`);
        }
      }
    }

    return sheetData;
  }

  private static processSheetData(jsonData: any[], sheetType: keyof ExcelSheetData): any[] {
    if (jsonData.length < 2) return []; // Need at least header + 1 data row

    const headers = jsonData[0].map((header: any) => 
      String(header || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '')
    );
    
    const dataRows = jsonData.slice(1).filter(row => 
      row && row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '')
    );

    return dataRows.map((row, index) => {
      const obj: any = { _rowNumber: index + 2 }; // +2 for header and 0-based index
      
      headers.forEach((header, colIndex) => {
        if (header) {
          const cellValue = row[colIndex];
          obj[header] = cellValue !== null && cellValue !== undefined ? String(cellValue).trim() : '';
        }
      });
      
      return obj;
    });
  }

  private static validateAndConvertData(
    sheetData: ExcelSheetData, 
    errors: string[], 
    warnings: string[]
  ): { users: User[]; categories: Category[]; expenses: Expense[] } {
    
    // Convert and validate users
    const users = this.convertUsers(sheetData.users, errors, warnings);
    
    // Convert and validate categories with subcategories
    const categories = this.convertCategories(sheetData.categories, sheetData.subcategories, errors, warnings);
    
    // Convert and validate expenses
    const expenses = this.convertExpenses(sheetData.expenses, users, categories, errors, warnings);

    return { users, categories, expenses };
  }

  private static convertUsers(userData: any[], errors: string[], warnings: string[]): User[] {
    const users: User[] = [];
    const usedUsernames = new Set<string>();
    const usedEmails = new Set<string>();

    const validColors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
      'bg-rose-500', 'bg-slate-500'
    ];

    userData.forEach((row, index) => {
      try {
        const id = row.id || row.userid || (index + 1).toString();
        const name = row.name || row.fullname || row.username || '';
        const username = row.username || row.user || name.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
        const email = row.email || row.emailaddress || `${username}@example.com`;
        const avatar = row.avatar || row.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
        const color = row.color || row.backgroundcolor || 'bg-blue-500';

        // Validation
        if (!name) {
          errors.push(`Users row ${row._rowNumber}: Name is required`);
          return;
        }

        if (usedUsernames.has(username)) {
          errors.push(`Users row ${row._rowNumber}: Duplicate username "${username}"`);
          return;
        }

        if (usedEmails.has(email)) {
          errors.push(`Users row ${row._rowNumber}: Duplicate email "${email}"`);
          return;
        }

        // Validate color
        const validatedColor = validColors.includes(color) ? color : 'bg-blue-500';
        if (color !== validatedColor) {
          warnings.push(`Users row ${row._rowNumber}: Invalid color "${color}", using default`);
        }

        const user: User = {
          id: id.toString(),
          name: name.trim(),
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          avatar: avatar.slice(0, 2).toUpperCase(),
          color: validatedColor,
          defaultCategoryId: row.defaultcategoryid || row.categoryid || undefined,
          defaultSubcategoryId: row.defaultsubcategoryid || row.subcategoryid || undefined,
          defaultStoreLocation: row.defaultstorelocation || row.location || undefined
        };

        users.push(user);
        usedUsernames.add(username);
        usedEmails.add(email);

      } catch (error) {
        errors.push(`Users row ${row._rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return users;
  }

  private static convertCategories(
    categoryData: any[], 
    subcategoryData: any[], 
    errors: string[], 
    warnings: string[]
  ): Category[] {
    const categories: Category[] = [];
    const categoryMap = new Map<string, Category>();

    const validColors = [
      'text-red-600', 'text-orange-600', 'text-amber-600', 'text-yellow-600',
      'text-lime-600', 'text-green-600', 'text-emerald-600', 'text-teal-600',
      'text-cyan-600', 'text-sky-600', 'text-blue-600', 'text-indigo-600',
      'text-violet-600', 'text-purple-600', 'text-fuchsia-600', 'text-pink-600',
      'text-rose-600', 'text-slate-600'
    ];

    // Process categories
    categoryData.forEach((row) => {
      try {
        const id = row.id || row.categoryid || '';
        const name = row.name || row.categoryname || '';
        const icon = row.icon || row.iconname || 'Tag';
        const color = row.color || row.textcolor || 'text-blue-600';

        if (!id || !name) {
          errors.push(`Categories row ${row._rowNumber}: ID and Name are required`);
          return;
        }

        // Validate color
        const validatedColor = validColors.includes(color) ? color : 'text-blue-600';
        if (color !== validatedColor) {
          warnings.push(`Categories row ${row._rowNumber}: Invalid color "${color}", using default`);
        }

        const category: Category = {
          id: id.toString(),
          name: name.trim(),
          icon: icon.trim(),
          color: validatedColor,
          subcategories: []
        };

        categoryMap.set(id.toString(), category);

      } catch (error) {
        errors.push(`Categories row ${row._rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    // Process subcategories
    subcategoryData.forEach((row) => {
      try {
        const id = row.id || row.subcategoryid || '';
        const name = row.name || row.subcategoryname || '';
        const categoryId = row.categoryid || row.parentcategoryid || '';

        if (!id || !name || !categoryId) {
          errors.push(`Subcategories row ${row._rowNumber}: ID, Name, and Category ID are required`);
          return;
        }

        const category = categoryMap.get(categoryId.toString());
        if (!category) {
          errors.push(`Subcategories row ${row._rowNumber}: Category ID "${categoryId}" not found`);
          return;
        }

        const subcategory = {
          id: id.toString(),
          name: name.trim(),
          categoryId: categoryId.toString()
        };

        category.subcategories.push(subcategory);

      } catch (error) {
        errors.push(`Subcategories row ${row._rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return Array.from(categoryMap.values());
  }

  private static convertExpenses(
    expenseData: any[], 
    users: User[], 
    categories: Category[], 
    errors: string[], 
    warnings: string[]
  ): Expense[] {
    const expenses: Expense[] = [];

    expenseData.forEach((row) => {
      try {
        const id = row.id || row.expenseid || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userId = row.userid || row.user || '';
        const categoryId = row.categoryid || row.category || '';
        const subcategoryId = row.subcategoryid || row.subcategory || '';
        const amount = parseFloat(row.amount || row.cost || row.price || '0');
        const description = row.description || row.desc || row.item || '';
        const notes = row.notes || row.note || row.comments || '';
        const storeName = row.storename || row.store || row.vendor || row.merchant || '';
        const storeLocation = row.storelocation || row.location || row.address || '';
        const date = this.parseDate(row.date || row.expensedate || row.transactiondate || '');
        const createdAt = this.parseDate(row.createdat || row.created || '') || new Date().toISOString();

        // Validation
        if (!userId) {
          errors.push(`Expenses row ${row._rowNumber}: User ID is required`);
          return;
        }

        if (!categoryId) {
          errors.push(`Expenses row ${row._rowNumber}: Category ID is required`);
          return;
        }

        if (!subcategoryId) {
          errors.push(`Expenses row ${row._rowNumber}: Subcategory ID is required`);
          return;
        }

        if (!description) {
          errors.push(`Expenses row ${row._rowNumber}: Description is required`);
          return;
        }

        if (amount <= 0 || isNaN(amount)) {
          errors.push(`Expenses row ${row._rowNumber}: Valid amount is required`);
          return;
        }

        if (!date) {
          errors.push(`Expenses row ${row._rowNumber}: Valid date is required`);
          return;
        }

        // Validate references
        const user = users.find(u => u.id === userId.toString());
        if (!user) {
          errors.push(`Expenses row ${row._rowNumber}: User ID "${userId}" not found`);
          return;
        }

        const category = categories.find(c => c.id === categoryId.toString());
        if (!category) {
          errors.push(`Expenses row ${row._rowNumber}: Category ID "${categoryId}" not found`);
          return;
        }

        const subcategory = category.subcategories.find(s => s.id === subcategoryId.toString());
        if (!subcategory) {
          errors.push(`Expenses row ${row._rowNumber}: Subcategory ID "${subcategoryId}" not found in category "${category.name}"`);
          return;
        }

        const expense: Expense = {
          id: id.toString(),
          userId: userId.toString(),
          categoryId: categoryId.toString(),
          subcategoryId: subcategoryId.toString(),
          amount,
          description: description.trim(),
          notes: notes ? notes.trim() : undefined,
          storeName: storeName ? storeName.trim() : undefined,
          storeLocation: storeLocation ? storeLocation.trim() : undefined,
          date,
          createdAt
        };

        expenses.push(expense);

      } catch (error) {
        errors.push(`Expenses row ${row._rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return expenses;
  }

  private static parseDate(dateValue: any): string {
    if (!dateValue) return '';

    try {
      // Handle Excel date serial numbers
      if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
      }

      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }

      // Handle Date objects
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
      }

      return '';
    } catch {
      return '';
    }
  }

  static generateBackupJSON(data: { users: User[]; categories: Category[]; expenses: Expense[] }): string {
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      users: data.users,
      categories: data.categories.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      subcategories: data.categories.flatMap(category =>
        category.subcategories.map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name,
          categoryId: category.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      ),
      expenses: data.expenses,
      credentials: {
        username: 'admin',
        password: 'pass123',
        email: 'admin@example.com',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',
        useCase: 'personal-team'
      },
      settings: {
        fontSize: 'small',
        auth: 'false'
      },
      useCase: 'personal-team'
    };

    return JSON.stringify(backup, null, 2);
  }

  static downloadExcelTemplate(): void {
    // Create a workbook with sample data
    const workbook = XLSX.utils.book_new();

    // Users sheet
    const usersData = [
      ['ID', 'Name', 'Username', 'Email', 'Avatar', 'Color', 'Default Category ID', 'Default Subcategory ID', 'Default Store Location'],
      [1, 'Alex Chen', 'alexc', 'alex.chen@example.com', 'AC', 'bg-emerald-500', 1, 1, 'Downtown'],
      [2, 'Sarah Johnson', 'sarahj', 'sarah.johnson@example.com', 'SJ', 'bg-blue-500', 2, 5, 'Uptown'],
      [3, 'Mike Rodriguez', 'miker', 'mike.rodriguez@example.com', 'MR', 'bg-purple-500', 3, 9, 'Bellevue']
    ];
    const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // Categories sheet
    const categoriesData = [
      ['ID', 'Name', 'Icon', 'Color'],
      [1, 'Groceries', 'ShoppingCart', 'text-green-600'],
      [2, 'Utilities', 'Zap', 'text-yellow-600'],
      [3, 'Entertainment', 'Music', 'text-purple-600'],
      [4, 'Transportation', 'Car', 'text-blue-600']
    ];
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

    // Subcategories sheet
    const subcategoriesData = [
      ['ID', 'Name', 'Category ID'],
      [1, 'Fresh Produce', 1],
      [2, 'Meat & Dairy', 1],
      [3, 'Pantry Items', 1],
      [4, 'Snacks & Beverages', 1],
      [5, 'Electricity', 2],
      [6, 'Water & Sewer', 2],
      [7, 'Internet & Cable', 2],
      [8, 'Gas', 2],
      [9, 'Movies & Shows', 3],
      [10, 'Gaming', 3],
      [11, 'Concerts & Events', 3],
      [12, 'Subscriptions', 3],
      [13, 'Fuel', 4],
      [14, 'Maintenance', 4],
      [15, 'Insurance', 4],
      [16, 'Parking & Tolls', 4]
    ];
    const subcategoriesSheet = XLSX.utils.aoa_to_sheet(subcategoriesData);
    XLSX.utils.book_append_sheet(workbook, subcategoriesSheet, 'Subcategories');

    // Expenses sheet
    const expensesData = [
      ['ID', 'User ID', 'Category ID', 'Subcategory ID', 'Amount', 'Description', 'Notes', 'Store Name', 'Store Location', 'Date', 'Created At'],
      [1, 1, 1, 1, 89.45, 'Weekly grocery shopping', 'Bought fresh vegetables and meat', 'Whole Foods Market', 'Downtown', '2025-01-18', '2025-01-18T10:30:00Z'],
      [2, 1, 4, 13, 45.00, 'Gas for car', 'Filled up the tank', 'Shell Station', 'Main Street', '2025-01-17', '2025-01-17T18:45:00Z'],
      [3, 2, 2, 5, 125.50, 'Monthly electricity bill', 'Higher than usual due to winter heating', 'City Electric', '', '2025-01-15', '2025-01-15T08:00:00Z'],
      [4, 2, 3, 12, 15.99, 'Netflix subscription', 'Monthly streaming service', 'Netflix', 'Online', '2025-01-14', '2025-01-14T20:00:00Z'],
      [5, 3, 1, 2, 67.32, 'Lunch ingredients', 'Bought items for meal prep', 'Trader Joes', 'Bellevue', '2025-01-16', '2025-01-16T15:30:00Z']
    ];
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

    // Download the file
    XLSX.writeFile(workbook, 'expense-tracker-excel-template.xlsx');
  }
}