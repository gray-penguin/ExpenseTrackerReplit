import React, { useState, useEffect } from 'react';
import { User, Category, Expense, SavedReport } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportExpensesToCSV, downloadCSV } from '../utils/csvUtils';
import { TrendingUp, Users, Calendar, Tag, Download, Save, FolderOpen, Printer, Filter, ChevronDown } from 'lucide-react';
import { useExpenseData } from '../hooks/useExpenseData';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

export function ReportsPage() {
  const { users, categories, expenses, savedReports, addSavedReport, updateSavedReport, deleteSavedReport } = useExpenseData();
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

  // Filter states
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [periodPreset, setPeriodPreset] = useState<string>('thisYear');

  // UI states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [modalExpenses, setModalExpenses] = useState<Expense[]>([]);
  const [modalTitle, setModalTitle] = useState('');

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(search);
    const userId = params.get('userId');
    const categoryId = params.get('categoryId');
    const urlStartDate = params.get('startDate');
    const urlEndDate = params.get('endDate');

    if (userId) setSelectedUserId(userId);
    if (categoryId) setSelectedCategoryId(categoryId);
    if (urlStartDate) {
      setStartDate(urlStartDate);
      setPeriodPreset('custom');
    }
    if (urlEndDate) {
      setEndDate(urlEndDate);
      setPeriodPreset('custom');
    }
  }, [search]);

  // Set default date range based on preset
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    switch (periodPreset) {
      case 'thisMonth':
        setStartDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);
        setEndDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`);
        break;
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        setStartDate(`${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`);
        setEndDate(`${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-${new Date(lastMonthYear, lastMonth + 1, 0).getDate()}`);
        break;
      case 'thisYear':
        setStartDate(`${currentYear}-01-01`);
        setEndDate(`${currentYear}-12-31`);
        break;
      case 'lastYear':
        setStartDate(`${currentYear - 1}-01-01`);
        setEndDate(`${currentYear - 1}-12-31`);
        break;
      case 'last12Months':
        const start12 = new Date(today);
        start12.setMonth(currentMonth - 11);
        setStartDate(`${start12.getFullYear()}-${String(start12.getMonth() + 1).padStart(2, '0')}-01`);
        setEndDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`);
        break;
    }
  }, [periodPreset]);

  // Filter to only show active users and their expenses
  const activeUsers = users.filter(user => user.isActive);
  const activeUserExpenses = expenses.filter(expense => 
    activeUsers.some(user => user.id === expense.userId)
  );

  // Apply filters to expenses
  const filteredExpenses = activeUserExpenses.filter(expense => {
    const matchesUser = selectedUserId === 'all' || expense.userId === selectedUserId;
    const matchesCategory = selectedCategoryId === 'all' || expense.categoryId === selectedCategoryId;
    const matchesDateRange = (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate);
    
    return matchesUser && matchesCategory && matchesDateRange;
  });

  // Generate month range for the report
  const generateMonthRange = (start: string, end: string): string[] => {
    if (!start || !end) return [];
    
    // Parse start and end dates directly from YYYY-MM-DD format
    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);
    
    const months: string[] = [];
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    // Generate months from start to end (inclusive)
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthString = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      months.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
      
      // Move to next month
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
      
      // Safety check to prevent infinite loops
      if (months.length > 24) {
        break;
      }
    }
    
    return months;
  };

  // Force re-calculation of month range when dates change
  const monthRange = React.useMemo(() => {
    const range = generateMonthRange(startDate, endDate);
    console.log('useMemo monthRange result:', range);
    return range;
  }, [startDate, endDate]);

  // Get selected category data
  const selectedCategory = selectedCategoryId === 'all' ? null : categories.find(c => c.id === selectedCategoryId);
  const subcategoriesToShow = selectedCategory ? selectedCategory.subcategories : 
    categories.flatMap(cat => cat.subcategories);

  // Calculate totals for each subcategory and month
  const calculateSubcategoryData = () => {
    return subcategoriesToShow.map(subcategory => {
      const subcategoryExpenses = filteredExpenses.filter(expense => expense.subcategoryId === subcategory.id);
      const monthlyTotals = monthRange.map(month => {
        const monthExpenses = subcategoryExpenses.filter(expense => expense.date.startsWith(month));
        return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      });
      const total = subcategoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        subcategory,
        monthlyTotals,
        total
      };
    }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);
  };

  const subcategoryData = calculateSubcategoryData();

  // Calculate monthly totals
  const monthlyTotals = monthRange.map(month => {
    const monthExpenses = filteredExpenses.filter(expense => expense.date.startsWith(month));
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  });

  // Calculate user totals for the current report
  const calculateUserTotals = () => {
    return activeUsers.map(user => {
      const userExpenses = filteredExpenses.filter(expense => expense.userId === user.id);
      const total = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        user,
        total,
        count: userExpenses.length
      };
    }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);
  };

  const userTotals = calculateUserTotals();

  const grandTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Handle CSV export
  const handleExportCSV = () => {
    const csvContent = exportExpensesToCSV(filteredExpenses, activeUsers, categories);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `expense-report-${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle save report
  const handleSaveReport = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    const report: Omit<SavedReport, 'id' | 'createdAt' | 'lastUsed'> = {
      name: reportName.trim(),
      description: reportDescription.trim() || undefined,
      filters: {
        selectedUserId,
        selectedCategoryId,
        startDate,
        endDate
      }
    };

    addSavedReport(report);
    setShowSaveDialog(false);
    setReportName('');
    setReportDescription('');
  };

  // Handle load report
  const handleLoadReport = (report: SavedReport) => {
    setSelectedUserId(report.filters.selectedUserId);
    setSelectedCategoryId(report.filters.selectedCategoryId);
    setStartDate(report.filters.startDate);
    setEndDate(report.filters.endDate);
    setPeriodPreset('custom');
    setShowLoadDialog(false);
    
    // Update the saved report's last used timestamp
    updateSavedReport(report.id, { lastUsed: new Date().toISOString() });
  };

  // Handle cell click to navigate to expenses
  const handleCellClick = (subcategoryId: string, month: string) => {
    // Find the subcategory to get its details
    const subcategoryItem = subcategoryData.find(item => item.subcategory.id === subcategoryId);
    if (!subcategoryItem) {
      console.error('Subcategory not found for ID:', subcategoryId);
      return;
    }
    
    // Filter expenses for this specific subcategory and month
    const monthExpenses = filteredExpenses.filter(expense => 
      expense.subcategoryId === subcategoryId && expense.date.startsWith(month)
    );
    
    // Set modal data
    setModalExpenses(monthExpenses);
    
    // Create modal title
    const [year, monthNum] = month.split('-');
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    setModalTitle(`${subcategoryItem.subcategory.name} - ${monthName}`);
    setShowExpenseModal(true);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            Expense Reports
          </h1>
          <p className="text-gray-600 mt-1">Spreadsheet-style expense analysis by category and time period</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLoadDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-sm"
          >
            <FolderOpen className="w-4 h-4" />
            Load Report
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {useCaseConfig.userLabelSingular}:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="all">{useCaseConfig.terminology.allUsers}</option>
              {activeUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Category:
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Period Preset */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Period:
            </label>
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="last12Months">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              From:
            </label>
            <input
              type="month"
              value={startDate ? startDate.slice(0, 7) : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setStartDate(`${value}-01`);
                  setPeriodPreset('custom');
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              To:
            </label>
            <input
              type="month"
              value={endDate ? endDate.slice(0, 7) : ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  const year = parseInt(value.split('-')[0]);
                  const month = parseInt(value.split('-')[1]);
                  const lastDay = new Date(year, month, 0).getDate();
                  setEndDate(`${value}-${lastDay}`);
                  setPeriodPreset('custom');
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 print:border-0 print:shadow-none">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Report Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Expenses */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-sm text-slate-600">Total Expenses</div>
          </div>

          {/* Subcategories Count */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {subcategoryData.length}
            </div>
            <div className="text-sm text-slate-600">Subcategories</div>
          </div>

          {/* Months Count */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {monthRange.length}
            </div>
            <div className="text-sm text-slate-600">Months</div>
          </div>

          {/* User Spending Breakdown */}
          <div className="text-center">
            {selectedUserId === 'all' && userTotals.length > 0 ? (
              <div>
                <div className="space-y-2">
                  {userTotals.slice(0, 3).map(({ user, total }) => (
                    <div key={user.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                          {user.avatar}
                        </div>
                        <span className="text-slate-700 truncate">{user.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
                    </div>
                  ))}
                  {userTotals.length > 3 && (
                    <div className="text-xs text-slate-500">+{userTotals.length - 3} more</div>
                  )}
                </div>
              </div>
            ) : selectedUserId !== 'all' ? (
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{formatCurrency(userTotals.find(ut => ut.user.id === selectedUserId)?.total || 0)}</div>
                <div className="text-sm text-slate-600">
                  {activeUsers.find(u => u.id === selectedUserId)?.name || 'Unknown User'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-1">$0.00</div>
                <div className="text-sm text-slate-600">No {useCaseConfig.terminology.users} with expenses</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
        <div className="p-4 border-b border-slate-200 print:border-slate-400">
          <h3 className="font-bold text-slate-900 text-sm">
            Expense Breakdown - {selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : activeUsers.find(u => u.id === selectedUserId)?.name} - {selectedCategoryId === 'all' ? 'All Categories' : selectedCategory?.name} ({startDate.slice(0, 7)} to {endDate.slice(0, 7)})
          </h3>
        </div>
        
        {subcategoryData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h3>
            <p className="text-slate-500">
              No expenses match your current filter criteria. Try adjusting the date range or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-2 font-semibold text-slate-700 sticky left-0 bg-slate-50 border-r border-slate-200 min-w-[120px]">
                    SUBCATEGORY
                  </th>
                  {monthRange.map((month, index) => {
                    console.log(`Rendering table header for month ${index}:`, month);
                    // Parse year and month from YYYY-MM format
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
                      .toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const yearShort = year.slice(-2);
                    
                    return (
                    <th key={month} className="text-center p-2 font-semibold text-slate-700 min-w-[80px] border-r border-slate-200">
                      {monthName} {yearShort}
                    </th>
                  )})}
                  <th className="text-center p-2 font-semibold text-slate-700 bg-slate-100 min-w-[80px]">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {subcategoryData.map((item, index) => (
                  <tr key={item.subcategory.id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="p-2 font-medium text-slate-900 sticky left-0 bg-inherit border-r border-slate-200">
                      {item.subcategory.name}
                    </td>
                    {item.monthlyTotals.map((amount, monthIndex) => (
                      <td key={monthIndex} className="text-center p-2 border-r border-slate-200">
                        {amount > 0 ? (
                          <button
                            onClick={() => handleCellClick(item.subcategory.id, monthRange[monthIndex])}
                            className="text-slate-900 hover:text-emerald-600 hover:bg-emerald-50 px-1 py-0.5 rounded transition-colors print:hover:bg-transparent print:hover:text-slate-900 cursor-pointer"
                          >
                            {formatCurrency(amount)}
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="text-center p-2 font-semibold text-slate-900 bg-slate-50">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
                {/* Monthly Totals Row */}
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
                  <td className="p-2 text-slate-900 sticky left-0 bg-slate-100 border-r border-slate-200">
                    MONTHLY TOTALS
                  </td>
                  {monthlyTotals.map((total, index) => (
                    <td key={index} className="text-center p-2 text-slate-900 border-r border-slate-200">
                      {total > 0 ? formatCurrency(total) : '-'}
                    </td>
                  ))}
                  <td className="text-center p-2 text-slate-900 bg-slate-200">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Export Options</h3>
            <p className="text-sm text-slate-500">Download your report data</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Save Report Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Save Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Describe this report..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Report Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Load Saved Report</h3>
              {savedReports.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No saved reports yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map(report => (
                    <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{report.name}</h4>
                          {report.description && (
                            <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                          )}
                          <div className="text-xs text-slate-500 mt-2">
                            Created: {formatDate(report.createdAt)} • Last used: {formatDate(report.lastUsed)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadReport(report)}
                            className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteSavedReport(report.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Details Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
                  <p className="text-slate-500">
                    {modalExpenses.length} expense{modalExpenses.length !== 1 ? 's' : ''} • 
                    Total: {formatCurrency(modalExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </p>
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {modalExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No expenses found for this period</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modalExpenses.map(expense => {
                    const user = activeUsers.find(u => u.id === expense.userId);
                    const category = categories.find(c => c.id === expense.categoryId);
                    const subcategory = category?.subcategories.find(s => s.id === expense.subcategoryId);
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${user?.color || 'bg-gray-500'} flex items-center justify-center text-white text-sm font-medium`}>
                            {user?.avatar || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{expense.description}</div>
                            <div className="text-sm text-slate-500">
                              {user?.name || 'Unknown User'} • {formatDate(expense.date)}
                              {expense.storeName && ` • ${expense.storeName}`}
                              {expense.storeLocation && ` (${expense.storeLocation})`}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}