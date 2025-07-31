import { Expense, User, Category } from '../types';

export interface CSVExpense {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  userEmail: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  amount: number;
  description: string;
  storeName: string;
  storeLocation: string;
  date: string;
  createdAt: string;
}

// Helper function to generate UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const exportExpensesToCSV = (
  expenses: Expense[],
  users: User[],
  categories: Category[]
): string => {
  const headers = [
    'ID',
    'User ID',
    'User Name',
    'Username',
    'Email',
    'Category ID',
    'Category Name',
    'Subcategory ID',
    'Subcategory Name',
    'Amount',
    'Description',
    'Store Name',
    'Store Location',
    'Date',
    'Created At'
  ];

  const csvData = expenses.map(expense => {
    const user = users.find(u => u.id === expense.userId);
    const category = categories.find(c => c.id === expense.categoryId);
    const subcategory = category?.subcategories.find(s => s.id === expense.subcategoryId);

    return [
      expense.id,
      expense.userId,
      user?.name || '',
      user?.username || '',
      user?.email || '',
      expense.categoryId,
      category?.name || '',
      expense.subcategoryId,
      subcategory?.name || '',
      expense.amount,
      `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
      `"${(expense.storeName || '').replace(/"/g, '""')}"`,
      `"${(expense.storeLocation || '').replace(/"/g, '""')}"`,
      expense.date,
      expense.createdAt
    ];
  });

  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSVContent = (csvContent: string): CSVExpense[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const expectedHeaders = [
    'ID', 'User ID', 'User Name', 'Username', 'Email', 'Category ID', 'Category Name',
    'Subcategory ID', 'Subcategory Name', 'Amount', 'Description',
    'Store Name', 'Store Location', 'Date', 'Created At'
  ];

  // Validate headers
  const missingHeaders = expectedHeaders.filter(header => 
    !headers.some(h => h.toLowerCase() === header.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const data: CSVExpense[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      if (values.length < expectedHeaders.length) {
        throw new Error(`Row ${i + 1}: Insufficient columns`);
      }

      const expense: CSVExpense = {
        id: values[0] || '',
        userId: values[1] || '',
        userName: values[2] || '',
        userUsername: values[3] || '',
        userEmail: values[4] || '',
        categoryId: values[5] || '',
        categoryName: values[6] || '',
        subcategoryId: values[7] || '',
        subcategoryName: values[8] || '',
        amount: parseFloat(values[9]) || 0,
        description: values[10] || '',
        storeName: values[11] || '',
        storeLocation: values[12] || '',
        date: values[13] || '',
        createdAt: values[14] || ''
      };

      // Validate required fields
      if (!expense.userId || !expense.categoryId || !expense.subcategoryId || 
          !expense.description || expense.amount <= 0 || !expense.date) {
        throw new Error(`Row ${i + 1}: Missing required data`);
      }

      // Validate date format
      if (isNaN(Date.parse(expense.date))) {
        throw new Error(`Row ${i + 1}: Invalid date format`);
      }

      data.push(expense);
    } catch (error) {
      throw new Error(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  }

  return data;
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  values.push(current.trim());

  return values;
};

export const validateImportData = (
  csvExpenses: CSVExpense[],
  users: User[],
  categories: Category[]
): { validExpenses: Expense[]; errors: string[] } => {
  const validExpenses: Expense[] = [];
  const errors: string[] = [];

  csvExpenses.forEach((csvExpense, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

    try {
      // Find or validate user
      let user = users.find(u => u.id === csvExpense.userId);
      if (!user && csvExpense.userName) {
        user = users.find(u => u.name.toLowerCase() === csvExpense.userName.toLowerCase());
      }
      if (!user && csvExpense.userUsername) {
        user = users.find(u => u.username.toLowerCase() === csvExpense.userUsername.toLowerCase());
      }
      if (!user && csvExpense.userEmail) {
        user = users.find(u => u.email.toLowerCase() === csvExpense.userEmail.toLowerCase());
      }
      if (!user) {
        throw new Error('User not found');
      }

      // Find or validate category
      let category = categories.find(c => c.id === csvExpense.categoryId);
      if (!category && csvExpense.categoryName) {
        category = categories.find(c => c.name.toLowerCase() === csvExpense.categoryName.toLowerCase());
      }
      if (!category) {
        throw new Error('Category not found');
      }

      // Find or validate subcategory
      let subcategory = category.subcategories.find(s => s.id === csvExpense.subcategoryId);
      if (!subcategory && csvExpense.subcategoryName) {
        subcategory = category.subcategories.find(s => 
          s.name.toLowerCase() === csvExpense.subcategoryName.toLowerCase()
        );
      }
      if (!subcategory) {
        throw new Error('Subcategory not found');
      }

      // Create valid expense
      const expense: Expense = {
        id: csvExpense.id || generateUUID(),
        userId: user.id,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        amount: csvExpense.amount,
        description: csvExpense.description,
        storeName: csvExpense.storeName || undefined,
        storeLocation: csvExpense.storeLocation || undefined,
        date: csvExpense.date,
        createdAt: csvExpense.createdAt || new Date().toISOString()
      };

      validExpenses.push(expense);
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  });

  return { validExpenses, errors };
};