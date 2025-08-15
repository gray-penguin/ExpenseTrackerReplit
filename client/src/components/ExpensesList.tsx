import React, { useState, useEffect } from 'react';
import { User, Category, Expense } from '../types';
import { ExpenseCard } from './ExpenseCard';
import { BulkExpenseForm } from './BulkExpenseForm';
import { Search, Filter, Tag, Users, DollarSign, Calendar, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, PlusCircle, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
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

type DateRangePreset = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
type ItemsPerPage = 10 | 20 | 50 | 100 | 'all';
type SortField = 'date' | 'amount' | 'description' | 'user' | 'category';
type SortOrder = 'asc' | 'desc';

interface DateRange {
  startDate: string;
  endDate: string;
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

  // Get available subcategories based on selected category
  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  // Get unique locations from all expenses
  const getUniqueLocations = (): string[] => {
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

  const uniqueLocations = getUniqueLocations();

  // Filter locations based on current input
  const filteredLocations = uniqueLocations.filter(location =>
    location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  // Reset subcategory when category changes
  // This effect is now handled above with better validation

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, filterUserId, locationFilter, dateRangePreset, customDateRange, sortBy, sortOrder, itemsPerPage]);

  // Helper function to format date to YYYY-MM-DD
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get date range based on preset
  const getDateRangeFromPreset = (preset: DateRangePreset): DateRange | null => {
    const today = new Date();
    const todayStr = formatDateForComparison(today);
    
    switch (preset) {
      case 'all':
        return null;
      
      case 'today':
        return { startDate: todayStr, endDate: todayStr };
      
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateForComparison(yesterday);
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      }
      
      case 'thisWeek': {
        const startOfWeek = new Date(today);
        // Get Sunday as start of week
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return {
          startDate: formatDateForComparison(startOfWeek),
          endDate: formatDateForComparison(endOfWeek)
        };
      }
      
      case 'lastWeek': {
        const startOfLastWeek = new Date(today);
        const dayOfWeek = startOfLastWeek.getDay();
        startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
        
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        
        return {
          startDate: formatDateForComparison(startOfLastWeek),
          endDate: formatDateForComparison(endOfLastWeek)
        };
      }
      
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return {
          startDate: formatDateForComparison(startOfMonth),
          endDate: formatDateForComparison(endOfMonth)
        };
      }
      
      case 'lastMonth': {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        return {
          startDate: formatDateForComparison(startOfLastMonth),
          endDate: formatDateForComparison(endOfLastMonth)
        };
      }
      
      case 'thisYear': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        
        return {
          startDate: formatDateForComparison(startOfYear),
          endDate: formatDateForComparison(endOfYear)
        };
      }
      
      case 'custom':
        return customDateRange.startDate && customDateRange.endDate ? customDateRange : null;
      
      default:
        return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const user = users.find(u => u.id === expense.userId);
    const category = categories.find(c => c.id === expense.categoryId);
    const subcategory = category?.subcategories.find(s => s.id === expense.subcategoryId);

    // Apply global user filter from header (if any)
    const matchesGlobalUser = !selectedUser || expense.userId === selectedUser.id;
    
    // Apply local user filter from expenses page filter
    const matchesFilterUser = !filterUserId || expense.userId === filterUserId;
    
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subcategory?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.storeLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || expense.subcategoryId === selectedSubcategory;
    
    // Location filter
    const matchesLocation = !locationFilter || 
      expense.storeLocation?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      expense.storeName?.toLowerCase().includes(locationFilter.toLowerCase());

    // Date range filtering - normalize expense date to YYYY-MM-DD format
    const dateRange = getDateRangeFromPreset(dateRangePreset);
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

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        // Ensure proper date comparison using local dates
        const dateA = a.date.includes('T') ? a.date.split('T')[0] : a.date;
        const dateB = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        const localDateA = new Date(dateA + 'T00:00:00');
        const localDateB = new Date(dateB + 'T00:00:00');
        comparison = localDateA.getTime() - localDateB.getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
      case 'user': {
        const userA = users.find(u => u.id === a.userId)?.name || '';
        const userB = users.find(u => u.id === b.userId)?.name || '';
        comparison = userA.localeCompare(userB);
        break;
      }
      case 'category': {
        const categoryA = categories.find(c => c.id === a.categoryId)?.name || '';
        const categoryB = categories.find(c => c.id === b.categoryId)?.name || '';
        comparison = categoryA.localeCompare(categoryB);
        break;
      }
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination calculations
  const totalItems = sortedExpenses.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);

  // Calculate total for filtered expenses
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate user totals for filtered expenses
  const userTotals = users.map(user => {
    const userExpenses = filteredExpenses.filter(expense => expense.userId === user.id);
    const total = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const count = userExpenses.length;
    return {
      user,
      total,
      count,
      percentage: filteredTotal > 0 ? (total / filteredTotal) * 100 : 0
    };
  }).filter(userTotal => userTotal.total > 0).sort((a, b) => b.total - a.total);

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

  const handleDateRangePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  const handleLocationSelect = (location: string) => {
    setLocationFilter(location);
    setShowLocationSuggestions(false);
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

  const getDateRangeLabel = (): string => {
    const dateRange = getDateRangeFromPreset(dateRangePreset);
    if (!dateRange) return '';
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: dateStr.split('-')[0] !== new Date().getFullYear().toString() ? 'numeric' : undefined
      });
    };
    
    if (dateRange.startDate === dateRange.endDate) {
      return formatDate(dateRange.startDate);
    }
    
    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
  };



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

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-emerald-600" /> : 
      <ArrowDown className="w-4 h-4 text-emerald-600" />;
  };

  const getSortLabel = (field: SortField) => {
    const labels = {
      date: 'Date',
      amount: 'Amount',
      description: 'Description',
      user: 'User',
      category: 'Category'
    };
    return labels[field];
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses, stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-1 text-slate-400" />
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="">All {useCaseConfig.terminology.users}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="">All categories</option>
              {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              disabled={!selectedCategory}
            >
              <option value="">
                {selectedCategory ? 'All subcategories' : 'Select category first'}
              </option>
              {availableSubcategories.sort((a, b) => a.name.localeCompare(b.name)).map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {uniqueLocations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowLocationSuggestions(!showLocationSuggestions)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showLocationSuggestions ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && uniqueLocations.length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLocationSuggestions(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                  <div className="p-2 border-b border-slate-100">
                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Available Locations ({uniqueLocations.length})
                    </div>
                  </div>
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-900 truncate">{location}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500">
                      No locations match "{locationFilter}"
                    </div>
                  )}
                  {locationFilter && (
                    <div className="p-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setLocationFilter('')}
                        className="w-full text-left px-2 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={dateRangePreset}
              onChange={(e) => handleDateRangePresetChange(e.target.value as DateRangePreset)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This week</option>
              <option value="lastWeek">Last week</option>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="thisYear">This year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRangePreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    min={customDateRange.startDate}
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700">Active filters:</span>
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {filterUserId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  <div className={`w-4 h-4 rounded-full ${users.find(u => u.id === filterUserId)?.color} flex items-center justify-center text-white text-xs font-medium mr-1`}>
                    {users.find(u => u.id === filterUserId)?.avatar}
                  </div>
                  User: {users.find(u => u.id === filterUserId)?.name}
                  <button
                    onClick={() => setFilterUserId('')}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedSubcategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Subcategory: {availableSubcategories.find(s => s.id === selectedSubcategory)?.name}
                  <button
                    onClick={() => setSelectedSubcategory('')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {locationFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  Location: "{locationFilter}"
                  <button
                    onClick={() => setLocationFilter('')}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {dateRangePreset !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  {dateRangePreset === 'custom' ? `Custom: ${getDateRangeLabel()}` : 
                   dateRangePreset.charAt(0).toUpperCase() + dateRangePreset.slice(1).replace(/([A-Z])/g, ' $1')}
                  {getDateRangeLabel() && dateRangePreset !== 'custom' && ` (${getDateRangeLabel()})`}
                  <button
                    onClick={() => handleDateRangePresetChange('all')}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={clearAllFilters}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Filter Context Information */}
        {selectedUser && !filterUserId && (
          <div className="mt-4 pt-4 border-t border-slate-200">
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

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? 's' : ''} found
              {hasActiveFilters && ` (${expenses.length} total)`}
              {itemsPerPage !== 'all' && sortedExpenses.length > 0 && (
                <span> • Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}</span>
              )}
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as ItemsPerPage)}
                className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Total Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {hasActiveFilters ? 'Filtered' : 'Total'} Expenses
              </h3>
              <p className="text-emerald-100 text-sm">
                {hasActiveFilters 
                  ? `${sortedExpenses.length} of ${expenses.length} expenses shown`
                  : `${sortedExpenses.length} total expenses`
                }
                {dateRangePreset !== 'all' && getDateRangeLabel() && (
                  <span> • {getDateRangeLabel()}</span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(filteredTotal)}</div>
            {hasActiveFilters && expenses.length > 0 && (
              <div className="text-emerald-100 text-sm">
                {((filteredTotal / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1)}% of total
              </div>
            )}
          </div>
        </div>
        
        {/* User Totals */}
        {userTotals.length > 0 && (
          <div className="border-t border-emerald-400/30 pt-4">
            <h4 className="text-emerald-100 text-sm font-medium mb-3 uppercase tracking-wide">Spending by {useCaseConfig.userLabelSingular}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {userTotals.map(({ user, total, count, percentage }) => (
                <div key={user.id} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                      {user.avatar}
                    </div>
                    <span className="font-medium text-white truncate">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{formatCurrency(total)}</div>
                    <div className="text-xs text-emerald-100">
                      {count} expense{count !== 1 ? 's' : ''} • {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Controls - Moved to top of expenses list */}
      {sortedExpenses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <div className="flex items-center gap-1">
              {(['date', 'amount', 'description', 'user', 'category'] as SortField[]).map((field) => {
                const fieldLabel = field === 'user' ? useCaseConfig.userLabelSingular : getSortLabel(field);
                return (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === field
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {fieldLabel}
                  {getSortIcon(field)}
                </button>
                );
              })}
            </div>
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
            const user = users.find(u => u.id === expense.userId);
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
      {itemsPerPage !== 'all' && totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} expenses
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              {/* Previous page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              {/* Next page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Last page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}



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