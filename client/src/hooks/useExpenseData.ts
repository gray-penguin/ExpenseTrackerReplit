import { useState, useEffect } from 'react';
import { useIndexedDBStorage } from './useIndexedDBStorage';
import { indexedDBStorage } from '../utils/indexedDBStorage';
import { User, Category, Expense } from '../types';

export function useExpenseData() {
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

  const isLoading = usersLoading || categoriesLoading || expensesLoading;

  // Helper functions for CRUD operations
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
    // Also delete all expenses for this user
    setExpenses(prev => prev.filter(expense => expense.userId !== id));
    setUsers(prev => prev.filter(user => user.id !== id));
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

  const importExpenses = (newExpenses: Expense[]) => {
    setExpenses(prev => [...prev, ...newExpenses]);
  };

  const addBulkExpenses = (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    const baseTime = Date.now();
    const newExpenses: Expense[] = expenses.map((expense, index) => ({
      ...expense,
      id: `${baseTime}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }));
    setExpenses(prev => [...prev, ...newExpenses]);
    return newExpenses;
  };

  const importUsers = (newUsers: User[]) => {
    setUsers(prev => [...prev, ...newUsers]);
  };

  const importCategories = (newCategories: Category[]) => {
    setCategories(prev => [...prev, ...newCategories]);
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  return {
    users,
    categories,
    expenses,
    isLoading,
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