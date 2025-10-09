export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  color: string;
  isActive: boolean;
  defaultCategoryId?: string;
  defaultSubcategoryId?: string;
  defaultStoreLocation?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  subcategoryId: string;
  amount: number;
  description: string;
  notes?: string;
  attachments?: ExpenseAttachment[];
  storeName?: string;
  storeLocation?: string;
  date: string;
  createdAt: string;
}

export interface SpendingSummary {
  totalSpent: number;
  categoryBreakdown: Array<{
    categoryId: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  filters: {
    selectedUserId: string;
    selectedCategoryIds: string[];
    selectedSubcategoryIds: string[];
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  lastUsed: string;
}