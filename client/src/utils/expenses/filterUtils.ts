import { Expense, User, Category } from '../../types';
import { DateRangePreset, DateRange } from '../../components/expenses/ExpenseFilters';
import { getDateRangeFromPreset } from './dateUtils';

export interface ExpenseFilterOptions {
  searchTerm: string;
  selectedCategory: string;
  selectedSubcategory: string;
  filterUserId: string;
  locationFilter: string;
  dateRangePreset: DateRangePreset;
  customDateRange: DateRange;
  selectedUser?: User | null;
}

export const filterExpenses = (
  expenses: Expense[],
  users: User[],
  categories: Category[],
  filters: ExpenseFilterOptions
): Expense[] => {
  return expenses.filter(expense => {
    const user = users.find(u => u.id === expense.userId);
    const category = categories.find(c => c.id === expense.categoryId);
    const subcategory = category?.subcategories.find(s => s.id === expense.subcategoryId);

    // Apply global user filter from header (if any)
    const matchesGlobalUser = !filters.selectedUser || expense.userId === filters.selectedUser.id;
    
    // Apply local user filter from expenses page filter
    const matchesFilterUser = !filters.filterUserId || expense.userId === filters.filterUserId;
    
    const matchesSearch = !filters.searchTerm || 
      expense.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      category?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      subcategory?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      expense.storeName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      expense.storeLocation?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesCategory = !filters.selectedCategory || expense.categoryId === filters.selectedCategory;
    const matchesSubcategory = !filters.selectedSubcategory || expense.subcategoryId === filters.selectedSubcategory;
    
    // Location filter
    const matchesLocation = !filters.locationFilter || 
      expense.storeLocation?.toLowerCase().includes(filters.locationFilter.toLowerCase()) ||
      expense.storeName?.toLowerCase().includes(filters.locationFilter.toLowerCase());

    // Date range filtering - normalize expense date to YYYY-MM-DD format
    const dateRange = getDateRangeFromPreset(filters.dateRangePreset, filters.customDateRange);
    let matchesDateRange = true;
    
    if (dateRange) {
      // Normalize expense date to YYYY-MM-DD format for comparison
      let expenseDate = expense.date;
      if (expense.date.includes('T')) {
        expenseDate = expense.date.split('T')[0];
      }
      
      // Compare dates as strings (YYYY-MM-DD format)
      matchesDateRange = expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
    }

    return matchesGlobalUser && matchesFilterUser && matchesSearch && matchesCategory && matchesSubcategory && matchesLocation && matchesDateRange;
  });
};

export const getUniqueLocations = (expenses: Expense[]): string[] => {
  const locationSet = new Set<string>();
  
  expenses.forEach(expense => {
    if (expense.storeLocation && expense.storeLocation.trim()) {
      locationSet.add(expense.storeLocation.trim());
    }
    if (expense.storeName && expense.storeName.trim()) {
      locationSet.add(expense.storeName.trim());
    }
  });
  
  return Array.from(locationSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};