import React, { useState, useEffect } from 'react';
import { User, Category, Expense } from '../types';
import { ExpenseCard } from './ExpenseCard';
import { BulkExpenseForm } from './BulkExpenseForm';
import { Search, PlusCircle, Plus } from 'lucide-react';
import { ExpenseFilters, DateRangePreset, DateRange } from './expenses/ExpenseFilters';
import { ExpenseSummary } from './expenses/ExpenseSummary';
import { ExpensePagination, ItemsPerPage } from './expenses/ExpensePagination';
import { ExpenseSorting, SortField, SortOrder } from './expenses/ExpenseSorting';
import { filterExpenses, getUniqueLocations, ExpenseFilterOptions } from '../utils/expenses/filterUtils';
import { sortExpenses } from '../utils/expenses/sortingUtils';
import { getDateRangeLabel } from '../utils/expenses/dateUtils';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

interface ExpensesListProps {
  expenses: Expense[];
  users: User[];
  categories: Category[];
  selectedUser: User | null;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;

  onAddBulkExpenses: (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;
  onAddExpense: () => void;
  initialCategoryId?: string;
  initialSubcategoryId?: string;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  users,
  categories,
  selectedUser,
  onEditExpense,
  onDeleteExpense,

  onAddBulkExpenses,
  onAddExpense,
  initialCategoryId = '',
  initialSubcategoryId = ''
}) => {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategoryId);
  const [filterUserId, setFilterUserId] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [showBulkForm, setShowBulkForm] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

  // Update filters when initial values change (from URL parameters)
  useEffect(() => {
    console.log('ExpensesList component received initial values:', { initialCategoryId, initialSubcategoryId });
    
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
      console.log('Set selected category to:', initialCategoryId);
    }
    if (initialSubcategoryId) {
      setSelectedSubcategory(initialSubcategoryId);
      console.log('Set selected subcategory to:', initialSubcategoryId);
    }
  }, [initialCategoryId, initialSubcategoryId]);

  const uniqueLocations = getUniqueLocations(expenses);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Only reset subcategory if it's not valid for the new category
    if (categoryId !== selectedCategory && selectedSubcategory) {
      const newCategoryData = categories.find(c => c.id === categoryId);
      const isValidSubcategory = newCategoryData?.subcategories.some(sub => sub.id === selectedSubcategory);
      
      if (!isValidSubcategory) {
        setSelectedSubcategory('');
      }
    }
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, filterUserId, locationFilter, dateRangePreset, customDateRange, sortBy, sortOrder, itemsPerPage]);

  const filteredExpenses = filterExpenses(expenses, users, categories, {
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    filterUserId,
    locationFilter,
    dateRangePreset,
    customDateRange,
    selectedUser
  });

  const sortedExpenses = sortExpenses(filteredExpenses, sortBy, sortOrder, users, categories);

  // Pagination calculations
  const totalItems = sortedExpenses.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handleDateRangePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setFilterUserId('');
    setLocationFilter('');
    setDateRangePreset('all');
    setCustomDateRange({ startDate: '', endDate: '' });
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterUserId || locationFilter || dateRangePreset !== 'all';
  const dateRangeLabel = getDateRangeLabel(dateRangePreset, customDateRange);

  const handleAddBulkExpenses = (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    onAddBulkExpenses(newExpenses);
    setShowBulkForm(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: ItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default order
      setSortBy(field);
      setSortOrder(field === 'date' ? 'desc' : 'asc'); // Default to desc for date, asc for others
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Import/Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
          <p className="text-slate-500 mt-1">Track and manage all your expenses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Multiple
          </button>

        </div>
      </div>

      {/* Filters */}
      <ExpenseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={setSelectedSubcategory}
        filterUserId={filterUserId}
        onUserFilterChange={setFilterUserId}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        dateRangePreset={dateRangePreset}
        onDateRangePresetChange={handleDateRangePresetChange}
        customDateRange={customDateRange}
        onCustomDateRangeChange={setCustomDateRange}
        users={users}
        categories={categories}
        uniqueLocations={uniqueLocations}
        showLocationSuggestions={showLocationSuggestions}
        onShowLocationSuggestions={setShowLocationSuggestions}
        onLocationSelect={(location) => {
          setLocationFilter(location);
          setShowLocationSuggestions(false);
        }}
        onClearAllFilters={clearAllFilters}
      />

      {/* Filter Context Information */}
      {selectedUser && !filterUserId && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className={`w-5 h-5 rounded-full ${selectedUser.color} flex items-center justify-center text-white text-xs font-medium`}>
              {selectedUser.avatar}
            </div>
            <span>Currently viewing expenses for <strong>{selectedUser.name}</strong></span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Use the {useCaseConfig.terminology.user} filter above to compare with other {useCaseConfig.terminology.users}</span>
          </div>
        </div>
      )}

      {/* Expense Total Summary */}
      <ExpenseSummary
        filteredExpenses={filteredExpenses}
        totalExpenses={expenses}
        users={users}
        hasActiveFilters={hasActiveFilters}
        dateRangeLabel={dateRangeLabel}
      />

      {/* Sort Controls - Moved to top of expenses list */}
      <ExpenseSorting
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        expenseCount={sortedExpenses.length}
      />

      {/* Results Summary */}
      {sortedExpenses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">
            {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? 's' : ''} found
            {hasActiveFilters && ` (${expenses.length} total)`}
            {itemsPerPage !== 'all' && sortedExpenses.length > 0 && (
              <span> • Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}</span>
            )}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {paginatedExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h3>
            <p className="text-slate-500">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first expense'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          paginatedExpenses.map(expense => {
            const user = users.find(u => u.id === expense.userId && u.isActive);
            const category = categories.find(c => c.id === expense.categoryId);
            const subcategory = category?.subcategories.find(s => s.id === expense.subcategoryId);

            // Provide fallback values to prevent undefined errors
            const safeUser = user || { 
              id: 'unknown',
              name: 'Unknown User',
              username: 'unknown',
              email: 'unknown@example.com',
              avatar: '?',
              color: 'bg-gray-500',
              defaultCategoryId: undefined,
              defaultSubcategoryId: undefined,
              defaultStoreLocation: undefined
            };
            const safeCategory = category || { id: '', name: 'Unknown Category', icon: 'Tag', color: 'text-gray-500', subcategories: [] };
            const subcategoryName = subcategory?.name || 'Unknown Subcategory';

            return (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                user={safeUser}
                category={safeCategory}
                subcategoryName={subcategoryName}
                onEdit={onEditExpense}
              />
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <ExpensePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Bulk Expense Form */}
      {showBulkForm && (
        <BulkExpenseForm
          users={users}
          categories={categories}
          expenses={expenses}
          onSubmit={handleAddBulkExpenses}
          onClose={() => setShowBulkForm(false)}
        />
      )}
    </div>
  );
};