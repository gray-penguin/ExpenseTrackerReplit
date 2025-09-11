import React, { useState, useMemo, useEffect } from 'react';
import { User, Category, Expense, SavedReport } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useExpenseData } from '../hooks/useExpenseData';
import { useLocation, useSearch } from 'wouter';
import { 
  Calendar, 
  Download, 
  Filter, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Printer,
  Save,
  Bookmark,
  Clock,
  Eye,
  Trash2,
  Edit3,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

interface ReportCell {
  subcategoryId: string;
  subcategoryName: string;
  monthlyTotals: { [month: string]: number };
  total: number;
}

interface MonthlyTotal {
  month: string;
  total: number;
}

export function ReportsPage() {
  const { 
    expenses, 
    users, 
    categories, 
    savedReports, 
    addSavedReport, 
    updateSavedReport, 
    deleteSavedReport 
  } = useExpenseData();
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);
  const [location, setLocation] = useLocation();
  const search = useSearch();

  // Filter to only show active users and their expenses
  const activeUsers = users.filter(user => user.isActive);
  const activeUserExpenses = expenses.filter(expense => 
    activeUsers.some(user => user.id === expense.userId)
  );

  // State for filters
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [periodPreset, setPeriodPreset] = useState<'custom' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'last12Months' | 'thisYear' | 'lastYear'>('last12Months');
  
  // Initialize dates based on default preset
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    date.setDate(1); // Ensure we're at the start of the month
    return date.toISOString().slice(0, 7);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().slice(0, 7);
  });

  // Saved reports state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [selectedCellExpenses, setSelectedCellExpenses] = useState<{
    expenses: Expense[];
    subcategoryName: string;
    month: string;
    total: number;
  } | null>(null);

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(search);
    const userId = params.get('userId');
    const categoryId = params.get('categoryId');
    const urlStartDate = params.get('startDate');
    const urlEndDate = params.get('endDate');
    
    if (userId) setSelectedUserId(userId);
    if (categoryId) setSelectedCategoryId(categoryId);
    if (urlStartDate) setStartDate(urlStartDate);
    if (urlEndDate) setEndDate(urlEndDate);
  }, [search]);

  // Handle period preset changes
  const handlePeriodPresetChange = (preset: typeof periodPreset) => {
    setPeriodPreset(preset);
    
    const today = new Date();
    let newStartDate = '';
    let newEndDate = '';
    
    switch (preset) {
      case 'thisMonth':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newStartDate = lastMonth.toISOString().slice(0, 7);
        newEndDate = lastMonth.toISOString().slice(0, 7);
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        newStartDate = threeMonthsAgo.toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        break;
      case 'last6Months':
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        newStartDate = sixMonthsAgo.toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        break;
      case 'last12Months':
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        newStartDate = twelveMonthsAgo.toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        break;
      case 'thisYear':
        newStartDate = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7);
        break;
      case 'lastYear':
        newStartDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().slice(0, 7);
        newEndDate = new Date(today.getFullYear() - 1, 11, 1).toISOString().slice(0, 7);
        break;
      case 'custom':
        // Don't change dates for custom
        return;
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };


  // Generate report data
  const reportData = useMemo(() => {
    let filteredExpenses = activeUserExpenses;

    // Filter by user
    if (selectedUserId !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.userId === selectedUserId);
    }

    // Filter by category
    if (selectedCategoryId !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.categoryId === selectedCategoryId);
    }

    // Filter by date range
    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return expenseMonth >= startDate && expenseMonth <= endDate;
    });

    // Generate months array
    const months: string[] = [];
    const start = new Date(startDate + '-01');
    const end = new Date(endDate + '-01');
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      months.push(d.toISOString().slice(0, 7));
    }

    // Get all subcategories for the selected category (or all if no category selected)
    const relevantCategories = selectedCategoryId === 'all' 
      ? categories 
      : categories.filter(c => c.id === selectedCategoryId);

    const allSubcategories = relevantCategories.flatMap(cat => 
      cat.subcategories.map(sub => ({
        ...sub,
        categoryName: cat.name,
        categoryColor: cat.color
      }))
    );

    // Build report data
    const result: ReportCell[] = allSubcategories.map(subcategory => {
      const subcategoryExpenses = filteredExpenses.filter(expense => 
        expense.subcategoryId === subcategory.id
      );

      const monthlyTotals: { [month: string]: number } = {};
      months.forEach(month => {
        const monthExpenses = subcategoryExpenses.filter(expense => 
          expense.date.slice(0, 7) === month
        );
        monthlyTotals[month] = monthExpenses.reduce((sum, expense) => {
          const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
          return sum + amount;
        }, 0);
      });

      const total = Object.values(monthlyTotals).reduce((sum, amount) => {
        const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
        return sum + validAmount;
      }, 0);

      return {
        subcategoryId: subcategory.id,
        subcategoryName: `${subcategory.categoryName} • ${subcategory.name}`,
        monthlyTotals,
        total
      };
    }).filter(row => row.total > 0).sort((a, b) => b.total - a.total);

    return result;
  }, [activeUserExpenses, selectedUserId, selectedCategoryId, startDate, endDate]);

  // Get subcategories for the selected category
  const subcategories = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return categories.flatMap(cat => cat.subcategories);
    }
    const category = categories.find(c => c.id === selectedCategoryId);
    return category?.subcategories || [];
  }, [categories, selectedCategoryId]);

  // Generate months array for headers
  const months = useMemo(() => {
    const monthsArray: string[] = [];
    const start = new Date(startDate + '-01');
    const end = new Date(endDate + '-01');
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      monthsArray.push(d.toISOString().slice(0, 7));
    }
    
    return monthsArray;
  }, [startDate, endDate]);

  // Calculate monthly totals
  const monthlyTotals: MonthlyTotal[] = useMemo(() => {
    return months.map(month => {
      const total = reportData.reduce((sum, row) => {
        const monthTotal = row.monthlyTotals[month] || 0;
        const validTotal = typeof monthTotal === 'number' && !isNaN(monthTotal) ? monthTotal : 0;
        return sum + validTotal;
      }, 0);
      
      return { month, total };
    });
  }, [reportData, months]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return reportData.reduce((sum, row) => {
      const rowTotal = typeof row.total === 'number' && !isNaN(row.total) ? row.total : 0;
      return sum + rowTotal;
    }, 0);
  }, [reportData]);

  // Calculate user totals for current filtered data
  const userTotals = useMemo(() => {
    if (selectedUserId !== 'all') return [];

    let filteredExpenses = activeUserExpenses;

    // Apply same filters as report data
    if (selectedCategoryId !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.categoryId === selectedCategoryId);
    }

    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return expenseMonth >= startDate && expenseMonth <= endDate;
    });

    return activeUsers.map(user => {
      const userExpenses = filteredExpenses.filter(expense => expense.userId === user.id);
      const total = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const count = userExpenses.length;
      const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
      
      return {
        user,
        total,
        count,
        percentage
      };
    }).filter(userTotal => userTotal.total > 0).sort((a, b) => b.total - a.total);
  }, [activeUserExpenses, activeUsers, selectedUserId, selectedCategoryId, startDate, endDate, grandTotal]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedUser = activeUsers.find(u => u.id === selectedUserId);

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // CSV Export functionality
  const exportToCSV = () => {
    const headers = ['Subcategory', ...months.map(month => {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }), 'Total'];

    const csvData = reportData.map(row => [
      row.subcategoryName,
      ...months.map(month => {
        const amount = row.monthlyTotals[month] || 0;
        return typeof amount === 'number' && !isNaN(amount) ? amount.toFixed(2) : '0.00';
      }),
      (typeof row.total === 'number' && !isNaN(row.total) ? row.total : 0).toFixed(2)
    ]);

    // Add totals row
    const totalsRow = [
      'TOTAL',
      ...monthlyTotals.map(mt => {
        const total = typeof mt.total === 'number' && !isNaN(mt.total) ? mt.total : 0;
        return total.toFixed(2);
      }),
      (typeof grandTotal === 'number' && !isNaN(grandTotal) ? grandTotal : 0).toFixed(2)
    ];

    const csvContent = [headers, ...csvData, totalsRow]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `expense-report-${timestamp}.csv`;
    link.setAttribute('download', filename);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle cell click to navigate to expenses
  const handleCellClick = (subcategoryId: string, month: string, event: React.MouseEvent) => {
    // Check if Ctrl/Cmd key is pressed for navigation, otherwise show details
    if (event.ctrlKey || event.metaKey) {
      navigateToExpenses(subcategoryId, month);
    } else {
      showExpenseDetails(subcategoryId, month);
    }
  };

  const navigateToExpenses = (subcategoryId: string, month: string) => {
    // Store current state for return navigation
    const returnState = {
      selectedUserId,
      selectedCategoryId,
      startDate,
      endDate
    };
    sessionStorage.setItem('expense-tracker-return-state', JSON.stringify(returnState));

    // Find the category for this subcategory
    const category = categories.find(cat => 
      cat.subcategories.some(sub => sub.id === subcategoryId)
    );
    
    if (!category) return;

    // Navigate to expenses page with filters
    const params = new URLSearchParams();
    params.set('categoryId', category.id);
    params.set('subcategoryId', subcategoryId);
    params.set('returnTo', 'reports');
    
    // Add date filter for the specific month
    const monthStart = month + '-01';
    const monthEnd = new Date(month + '-01');
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0); // Last day of the month
    const monthEndStr = monthEnd.toISOString().slice(0, 10);
    
    params.set('startDate', monthStart);
    params.set('endDate', monthEndStr);
    
    if (selectedUserId !== 'all') {
      params.set('userId', selectedUserId);
    }
    
    setLocation(`/expenses?${params.toString()}`);
  };

  const showExpenseDetails = (subcategoryId: string, month: string) => {
    // Find expenses for this subcategory and month
    let filteredExpenses = activeUserExpenses;

    // Apply same filters as report data
    if (selectedUserId !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.userId === selectedUserId);
    }

    if (selectedCategoryId !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.categoryId === selectedCategoryId);
    }

    // Filter by subcategory and month
    const cellExpenses = filteredExpenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return expense.subcategoryId === subcategoryId && expenseMonth === month;
    });

    if (cellExpenses.length === 0) return;

    // Find subcategory name
    const subcategory = categories
      .flatMap(cat => cat.subcategories)
      .find(sub => sub.id === subcategoryId);
    
    const category = categories.find(cat => 
      cat.subcategories.some(sub => sub.id === subcategoryId)
    );

    const subcategoryName = subcategory && category 
      ? `${category.name} • ${subcategory.name}`
      : 'Unknown Subcategory';

    const total = cellExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    setSelectedCellExpenses({
      expenses: cellExpenses,
      subcategoryName,
      month,
      total
    });
  };

  // Save report functionality
  const handleSaveReport = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    const newReport: Omit<SavedReport, 'id' | 'createdAt' | 'lastUsed'> = {
      name: reportName.trim(),
      description: reportDescription.trim() || undefined,
      filters: {
        selectedUserId,
        selectedCategoryId,
        startDate,
        endDate
      }
    };

    addSavedReport(newReport);
    setShowSaveDialog(false);
    setReportName('');
    setReportDescription('');
  };

  const handleLoadReport = (report: SavedReport) => {
    setSelectedUserId(report.filters.selectedUserId);
    setSelectedCategoryId(report.filters.selectedCategoryId);
    setStartDate(report.filters.startDate);
    setEndDate(report.filters.endDate);
    
    // Update the saved report's last used timestamp
    updateSavedReport(report.id, {});
    setShowSavedReports(false);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this saved report?')) {
      deleteSavedReport(reportId);
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analyze your spending patterns with detailed reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSavedReports(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            <Bookmark className="w-4 h-4" />
            Saved Reports ({savedReports.length})
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Report
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{useCaseConfig.userLabelSingular}</label>
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                <option value="all">{useCaseConfig.terminology.allUsers}</option>
                {activeUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <div className="relative">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <div className="relative">
              <select
                value={periodPreset}
                onChange={(e) => handlePeriodPresetChange(e.target.value as typeof periodPreset)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                <option value="custom">Custom Range</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="last6Months">Last 6 Months</option>
                <option value="last12Months">Last 12 Months</option>
                <option value="thisYear">This Year</option>
                <option value="lastYear">Last Year</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From Month</label>
            <div className="relative">
              <input
                type="month"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To Month</label>
            <div className="relative">
              <input
                type="month"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                min={startDate}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white print:bg-emerald-600">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-emerald-100 text-xs">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
          <div className="text-emerald-100 text-xs">
            {selectedUser ? `${selectedUser.name}'s expenses` : 'All users combined'}
            {selectedCategory && ` • ${selectedCategory.name}`}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="text-right">
              <p className="text-slate-500 text-xs">Transactions</p>
              <p className="text-xl font-bold text-slate-900">{reportData.reduce((sum, row) => {
                return sum + Object.values(row.monthlyTotals).filter(amount => {
                  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
                  return validAmount > 0;
                }).length;
              }, 0)}</p>
            </div>
          </div>
          <div className="text-slate-500 text-xs">
            Across {reportData.length} subcategories
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="text-right">
              <p className="text-slate-500 text-xs">Period</p>
              <p className="text-base font-bold text-slate-900">
                {(() => {
                  const startMonth = new Date(startDate + '-01');
                  const endMonth = new Date(endDate + '-01');
                  const startLabel = startMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  const endLabel = endMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
                })()}
              </p>
            </div>
          </div>
          <div className="text-slate-500 text-xs">
            {months.length} month{months.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      </div>

      {/* User Totals - Compact Display */}
      {userTotals.length > 0 && selectedUserId === 'all' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Spending by {useCaseConfig.userLabelSingular}</h4>
          <div className="flex flex-wrap gap-2">
            {userTotals.map(({ user, total, count, percentage }) => (
              <div key={user.id} className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-sm">
                <span className="font-medium text-slate-900">{user.name}</span>
                <span className="text-slate-600">•</span>
                <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500">{count} expenses • {percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:rounded-none print:border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 print:bg-slate-100">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-900 sticky left-0 bg-slate-50 print:bg-slate-100 border-r border-slate-200 min-w-[200px]">
                  Subcategory
                </th>
                {months.map(month => {
                  const date = new Date(month + '-01');
                  const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return (
                    <th key={month} className="text-center p-3 font-semibold text-slate-900 min-w-[100px]">
                      {label}
                    </th>
                  );
                })}
                <th className="text-center p-3 font-semibold text-slate-900 bg-emerald-50 print:bg-emerald-100 min-w-[100px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={row.subcategoryId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}>
                  <td className="p-3 font-medium text-slate-900 sticky left-0 bg-inherit border-r border-slate-200">
                    {row.subcategoryName}
                  </td>
                  {months.map(month => {
                    const amount = row.monthlyTotals[month] || 0;
                    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
                    const hasExpenses = validAmount > 0;
                    
                    return (
                      <td key={month} className="p-3 text-center">
                        {hasExpenses ? (
                          <button
                            onClick={(e) => handleCellClick(row.subcategoryId, month, e)}
                            className="text-slate-900 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors print:hover:bg-transparent print:hover:text-slate-900"
                            title="Click to view details • Ctrl+Click to navigate to expenses"
                          >
                            {formatCurrency(validAmount)}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-semibold text-slate-900 bg-emerald-50 print:bg-emerald-100">
                    {formatCurrency(typeof row.total === 'number' && !isNaN(row.total) ? row.total : 0)}
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-slate-100 print:bg-slate-200 border-t-2 border-slate-300">
                <td className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-100 print:bg-slate-200 border-r border-slate-200">
                  TOTAL
                </td>
                {monthlyTotals.map(({ month, total }) => {
                  const validTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
                  return (
                    <td key={month} className="p-3 text-center font-bold text-slate-900">
                      {validTotal > 0 ? formatCurrency(validTotal) : '—'}
                    </td>
                  );
                })}
                <td className="p-3 text-center font-bold text-slate-900 bg-emerald-100 print:bg-emerald-200">
                  {formatCurrency(typeof grandTotal === 'number' && !isNaN(grandTotal) ? grandTotal : 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {reportData.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center print:hidden">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No data for this period</h3>
          <p className="text-slate-500">
            Try adjusting your filters or date range to see expense data
          </p>
        </div>
      )}

      {/* Save Report Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Save Report</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Report Name *</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Optional description"
                />
              </div>
              
              <div className="bg-slate-50 rounded-lg p-3">
                <h4 className="font-medium text-slate-900 mb-2">Current Filters:</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>{useCaseConfig.userLabelSingular}: {selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name}</div>
                  <div>Category: {selectedCategoryId === 'all' ? 'All Categories' : selectedCategory?.name}</div>
                  <div>Period: {(() => {
                    const startMonth = new Date(startDate + '-01');
                    const endMonth = new Date(endDate + '-01');
                    const startLabel = startMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const endLabel = endMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
                  })()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                disabled={!reportName.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports Dialog */}
      {showSavedReports && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-slate-900">Saved Reports</h3>
              <button
                onClick={() => setShowSavedReports(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6">
              {savedReports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">No saved reports</h4>
                  <p className="text-slate-500">Save your current report configuration to access it later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map(report => (
                    <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{report.name}</h4>
                          {report.description && (
                            <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                          )}
                          <div className="text-xs text-slate-500 mt-2 space-y-1">
                            <div>
                              {useCaseConfig.userLabelSingular}: {report.filters.selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : activeUsers.find(u => u.id === report.filters.selectedUserId)?.name}
                            </div>
                            <div>
                              Category: {report.filters.selectedCategoryId === 'all' ? 'All Categories' : categories.find(c => c.id === report.filters.selectedCategoryId)?.name}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created: {formatDate(report.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                Last used: {formatDate(report.lastUsed)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadReport(report)}
                            className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expense Details Modal */}
      {selectedCellExpenses && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedCellExpenses.subcategoryName}</h3>
                <p className="text-slate-500">
                  {(() => {
                    const date = new Date(selectedCellExpenses.month + '-01');
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  })()} • {selectedCellExpenses.expenses.length} expenses • {formatCurrency(selectedCellExpenses.total)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCellExpenses(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {selectedCellExpenses.expenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(expense => {
                    const user = activeUsers.find(u => u.id === expense.userId);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{expense.description}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-2">
                            <span>{user?.name}</span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                            {expense.storeName && (
                              <>
                                <span>•</span>
                                <span>{expense.storeName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(expense.amount)}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Total for this period:</span>
                  <span className="font-bold text-slate-900 text-lg">{formatCurrency(selectedCellExpenses.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}