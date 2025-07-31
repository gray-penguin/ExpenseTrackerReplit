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
  const [location] = useLocation();
  const search = useSearch();
  const { users, categories, expenses, addExpense, addBulkExpenses, updateExpense, deleteExpense } = useExpenseData();

  // Parse URL params for filtering using wouter's useSearch hook
  useEffect(() => {
    const params = new URLSearchParams(search);
    const categoryId = params.get('categoryId');
    const subcategoryId = params.get('subcategoryId');
    
    if (categoryId) {
      setInitialCategoryId(categoryId);
    }
    if (subcategoryId) {
      setInitialSubcategoryId(subcategoryId);
    }
  }, [location, search]);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}