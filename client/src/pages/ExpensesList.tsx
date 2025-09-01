import { useState, useEffect } from 'react';
import { User, Category, Expense } from '../types';
import { Plus } from 'lucide-react';
import { ExpenseForm } from '../components/ExpenseForm';
import { UserSelector } from '../components/UserSelector';
import { ExpensesList as ExpensesListComponent } from '../components/ExpensesList';
import { useExpenseData } from '../hooks/useExpenseData';
import { useLocation, useSearch } from 'wouter';

export function ExpensesList() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [initialCategoryId, setInitialCategoryId] = useState<string>('');
  const [initialSubcategoryId, setInitialSubcategoryId] = useState<string>('');
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { users, categories, expenses, addExpense, addBulkExpenses, updateExpense, deleteExpense } = useExpenseData();

  // Parse URL params for filtering using wouter's useSearch hook
  useEffect(() => {
    console.log('ExpensesList useEffect triggered with search:', search);
    const params = new URLSearchParams(search);
    const categoryId = params.get('categoryId');
    const subcategoryId = params.get('subcategoryId');
    const editExpenseId = params.get('edit');
    
    console.log('ExpensesList page parsing URL params:', { categoryId, subcategoryId, editExpenseId });
    
    if (categoryId) {
      setInitialCategoryId(categoryId);
      console.log('Setting initial category ID:', categoryId);
    }
    if (subcategoryId) {
      setInitialSubcategoryId(subcategoryId);
      console.log('Setting initial subcategory ID:', subcategoryId);
    }
    
    // Check for edit parameter to open edit form
    if (editExpenseId) {
      console.log('Found edit parameter:', editExpenseId);
      const expenseToEdit = expenses.find(exp => exp.id === editExpenseId);
      console.log('Found expense to edit:', expenseToEdit);
      if (expenseToEdit) {
        setEditingExpense(expenseToEdit);
        setShowExpenseForm(true);
        console.log('Opening edit form for expense:', expenseToEdit.id);
        
        // Clear the edit parameter from URL after opening the form
        const newParams = new URLSearchParams(search);
        newParams.delete('edit');
        const newSearch = newParams.toString();
        const newUrl = newSearch ? `/expenses?${newSearch}` : '/expenses';
        console.log('Clearing edit parameter, new URL:', newUrl);
        // Use setTimeout to ensure state updates complete first
        setTimeout(() => {
          window.history.replaceState({}, '', newUrl);
        }, 100);
      } else {
        console.log('Expense not found for ID:', editExpenseId);
      }
    }
  }, [location, search, expenses]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
  };



  const handleAddBulkExpenses = (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    addBulkExpenses(newExpenses);
  };

  return (
    <div className="space-y-6">
      {/* Expenses List Component */}
      <ExpensesListComponent
        expenses={expenses}
        users={users}
        categories={categories}
        selectedUser={selectedUser}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}

        onAddBulkExpenses={handleAddBulkExpenses}
        onAddExpense={() => setShowExpenseForm(true)}
        initialCategoryId={initialCategoryId}
        initialSubcategoryId={initialSubcategoryId}
      />

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          users={users}
          categories={categories}
          expenses={expenses}
          expense={editingExpense}
          onSubmit={handleAddExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(undefined);
          }}
          onDelete={editingExpense ? handleDeleteExpense : undefined}
        />
      )}
    </div>
  );
}