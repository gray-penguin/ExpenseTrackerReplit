import { useState, useEffect } from 'react';
import { useIndexedDBStorage } from './useIndexedDBStorage';
import { indexedDBStorage } from '../utils/indexedDBStorage';
import { User, Category, Expense } from '../types';

export function useExpenseData() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use IndexedDB for persistence
  const [users, setUsers, { isLoading: usersLoading }] = useIndexedDBStorage<User[]>(
    'users',
    [],
    () => indexedDBStorage.getUsers(),
    (users) => indexedDBStorage.setUsers(users)
  );
  
  const [categories, setCategories, { isLoading: categoriesLoading }] = useIndexedDBStorage<Category[]>(
    'categories',
    [],
    () => indexedDBStorage.getCategories(),
    (categories) => indexedDBStorage.setCategories(categories)
  );
  
  const [expenses, setExpenses, { isLoading: expensesLoading }] = useIndexedDBStorage<Expense[]>(
    'expenses',
    [],
    () => indexedDBStorage.getExpenses(),
    (expenses) => indexedDBStorage.setExpenses(expenses)
  );

  // Initialize mock data only once
  useEffect(() => {
    const initializeOnce = async () => {
      if (!isInitialized && !usersLoading && !categoriesLoading && !expensesLoading) {
        try {
          await indexedDBStorage.initializeMockData();
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize mock data:', error);
          setIsInitialized(true); // Set to true anyway to prevent infinite retries
        }
      }
    };
    
    initializeOnce();
  }, [usersLoading, categoriesLoading, expensesLoading, isInitialized]);

  const isLoading = usersLoading || categoriesLoading || expensesLoading;
  
  // Add timeout to prevent infinite loading
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('ExpenseData: Loading timeout reached, forcing completion');
        setHasTimedOut(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const finalIsLoading = isLoading && !hasTimedOut;

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const processedUpdates = {
      ...updates,
      ...(updates.amount !== undefined && { 
        amount: typeof updates.amount === 'string' ? parseFloat(updates.amount) : updates.amount 
      })
    };
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...processedUpdates } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also delete all expenses for this user
    setExpenses(prev => prev.filter(expense => expense.userId !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const categoryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCategory: Category = {
      ...category,
      id: categoryId,
      subcategories: category.subcategories.map((sub, index) => ({
        ...sub,
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        categoryId: categoryId
      }))
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const deleteCategory = (id: string) => {
    // Also delete all expenses for this category
    setExpenses(prev => prev.filter(expense => expense.categoryId !== id));
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const addBulkExpenses = (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    const newExpenses = expenses.map(expense => ({
      ...expense,
      amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }));
    setExpenses(prev => [...prev, ...newExpenses]);
    return newExpenses;
  };

  const importExpenses = (expenses: Expense[]) => {
    setExpenses(expenses);
  };

  const importUsers = (users: User[]) => {
    setUsers(users);
  };

  const importCategories = (categories: Category[]) => {
    setCategories(categories);
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  return {
    users,
    categories,
    expenses,
    isLoading: finalIsLoading,
    addExpense,
    addBulkExpenses,
    updateExpense,
    deleteExpense,
    addUser,
    updateUser,
    deleteUser,
    addCategory,
    updateCategory,
    deleteCategory,
    importExpenses,
    importUsers,
    importCategories,
    clearAllExpenses,
    setUsers,
    setCategories,
    setExpenses
  };
}