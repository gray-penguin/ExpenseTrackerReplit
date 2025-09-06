import React, { useState, useMemo, useEffect } from 'react';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/formatters';
import { Calendar, Filter, TrendingUp, X, Eye, Users, Printer, Save, FolderOpen, Star, Trash2, Edit3, CalendarDays } from 'lucide-react';
import { Pencil } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Expense, SavedReport } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';
import { useLocation } from 'wouter';

type DatePreset = 'custom' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'last30Days' | 'last90Days';

export const ReportsPage: React.FC = () => {
  const { expenses, categories, users, savedReports, addSavedReport, updateSavedReport, deleteSavedReport } = useExpenseData();
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);
  const [location, setLocation] = useLocation();
  const search = new URLSearchParams(window.location.search);
  
  // Filter to only show active users and their expenses
  const activeUsers = users.filter(user => user.isActive);
  const activeUserExpenses = expenses.filter(expense => 
    activeUsers.some(user => user.id === expense.userId)
  );

  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 7)); // Start of current year
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 7)); // Current month
  const [datePreset, setDatePreset] = useState<DatePreset>('custom');
  
  // Saved reports state
  const [showSaveReportModal, setShowSaveReportModal] = useState(false);
  const [showLoadReportModal, setShowLoadReportModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  
  // Modal state for expense details
  const [selectedCell, setSelectedCell] = useState<{
    subcategoryId: string;
    monthKey: string;
    subcategoryName: string;
    categoryName: string;
    monthLabel: string;
    expenses: Expense[];
  } | null>(null);

  // Date preset options
  const datePresetOptions: { value: DatePreset; label: string }[] = [
    { value: 'custom', label: 'Custom Range' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last90Days', label: 'Last 90 Days' }
  ];

  // Function to apply date preset
  const applyDatePreset = (preset: DatePreset) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().slice(0, 10); // YYYY-MM-DD
    const formatMonth = (date: Date) => date.toISOString().slice(0, 7); // YYYY-MM

    switch (preset) {
      case 'today':
        const todayStr = formatDate(today);
        setStartDate(todayStr.slice(0, 7)); // Convert to month format
        setEndDate(todayStr.slice(0, 7));
        break;

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        setStartDate(yesterdayStr.slice(0, 7));
        setEndDate(yesterdayStr.slice(0, 7));
        break;

      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        setStartDate(formatMonth(startOfWeek));
        setEndDate(formatMonth(endOfWeek));
        break;

      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        setStartDate(formatMonth(lastWeekStart));
        setEndDate(formatMonth(lastWeekEnd));
        break;

      case 'thisMonth':
        const thisMonth = formatMonth(today);
        setStartDate(thisMonth);
        setEndDate(thisMonth);
        break;

      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthStr = formatMonth(lastMonth);
        setStartDate(lastMonthStr);
        setEndDate(lastMonthStr);
        break;

      case 'thisYear':
        const thisYear = today.getFullYear();
        setStartDate(`${thisYear}-01`);
        setEndDate(`${thisYear}-12`);
        break;

      case 'lastYear':
        const lastYear = today.getFullYear() - 1;
        setStartDate(`${lastYear}-01`);
        setEndDate(`${lastYear}-12`);
        break;

      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setStartDate(formatMonth(thirtyDaysAgo));
        setEndDate(formatMonth(today));
        break;

      case 'last90Days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        setStartDate(formatMonth(ninetyDaysAgo));
        setEndDate(formatMonth(today));
        break;

      case 'custom':
      default:
        // Don't change dates for custom
        break;
    }
  };

  // Handle date preset change
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      applyDatePreset(preset);
    }
  };

  // Update preset to 'custom' when dates are manually changed
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setDatePreset('custom');
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setDatePreset('custom');
  };

  // Restore filters from URL parameters on page load
  useEffect(() => {
    const userId = search.get('userId');
    const categoryId = search.get('categoryId');
    const startDateParam = search.get('startDate');
    const endDateParam = search.get('endDate');
    
    if (userId) setSelectedUserId(userId);
    if (categoryId) setSelectedCategoryId(categoryId);
    if (startDateParam) setStartDate(startDateParam);
    if (endDateParam) setEndDate(endDateParam);
  }, []);

  // Get available date range from expenses
  const dateRange = useMemo(() => {
    if (expenses.length === 0) return { minDate: '', maxDate: '' };
    
    const dates = expenses.map(expense => expense.date);
    const minDate = dates.reduce((min, date) => date < min ? date : min);
    const maxDate = dates.reduce((max, date) => date > max ? date : max);
    
    return { 
      minDate: minDate.slice(0, 7), // YYYY-MM format
      maxDate: maxDate.slice(0, 7)
    };
  }, [expenses]);

  // Generate months array for the selected date range
  const months = useMemo(() => {
    const monthsList: { year: number; month: number; label: string; key: string }[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Parse start and end dates
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const [endYear, endMonth] = endDate.split('-').map(Number);
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      monthsList.push({
        year: currentYear,
        month: currentMonth - 1, // JavaScript months are 0-indexed
        label: `${monthNames[currentMonth - 1]} ${currentYear}`,
        key: `${currentYear}-${String(currentMonth).padStart(2, '0')}`
      });
      
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
    
    return monthsList;
  }, [startDate, endDate]);

  // Filter expenses by selected category and date range
  const filteredExpenses = useMemo(() => {
    const result = activeUserExpenses.filter(expense => {
      const expenseDate = expense.date.slice(0, 7); // YYYY-MM format
      const userMatch = selectedUserId === 'all' || expense.userId === selectedUserId;
      const categoryMatch = selectedCategoryId === 'all' || expense.categoryId === selectedCategoryId;
      // Ensure proper inclusive date range comparison
      const dateMatch = expenseDate >= startDate && expenseDate <= endDate;
      
      return userMatch && categoryMatch && dateMatch;
    });
    
    return result;
  }, [activeUserExpenses, selectedUserId, selectedCategoryId, startDate, endDate]);</parameter>

  // Get subcategories for the selected category
  const subcategories = useMemo(() => {
    if (selectedCategoryId === 'all') {
      // Get all subcategories from all categories
      const allSubcategories: Array<{id: string, name: string, categoryName: string}> = [];
      categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          allSubcategories.push({
            id: subcategory.id,
            name: subcategory.name,
            categoryName: category.name
          });
        });
      });
      return allSubcategories.sort((a, b) => {
        if (a.categoryName !== b.categoryName) {
          return a.categoryName.localeCompare(b.categoryName);
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      const category = categories.find(c => c.id === selectedCategoryId);
      return category ? category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        categoryName: category.name
      })).sort((a, b) => a.name.localeCompare(b.name)) : [];
    }
  }, [categories, selectedCategoryId]);

  // Calculate expense totals by subcategory and month
  const reportData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    
    // Initialize data structure
    subcategories.forEach(subcategory => {
      data[subcategory.id] = {};
      months.forEach(month => {
        data[subcategory.id][month.key] = 0;
      });
    });

    // Populate with expense data
    filteredExpenses.forEach(expense => {
      const expenseMonth = expense.date.slice(0, 7); // YYYY-MM format
      if (data[expense.subcategoryId]) {
        // Initialize the month if it doesn't exist (this handles edge cases)
        if (data[expense.subcategoryId][expenseMonth] === undefined) {
          data[expense.subcategoryId][expenseMonth] = 0;
        }
        // Ensure amount is a valid number
        const validAmount = isNaN(expense.amount) ? 0 : expense.amount;
        data[expense.subcategoryId][expenseMonth] += validAmount;
      }
    });

    return data;
  }, [filteredExpenses, subcategories, months]);

  // Calculate totals
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    months.forEach(month => {
      totals[month.key] = 0;
      subcategories.forEach(subcategory => {
        const amount = reportData[subcategory.id]?.[month.key] || 0;
        const validAmount = isNaN(amount) ? 0 : amount;
        totals[month.key] += validAmount;
      });
      // Ensure the total is a valid number
      if (isNaN(totals[month.key])) {
        totals[month.key] = 0;
      }
    });
    return totals;
  }, [reportData, subcategories, months]);

  const subcategoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    subcategories.forEach(subcategory => {
      totals[subcategory.id] = 0;
      months.forEach(month => {
        const amount = reportData[subcategory.id]?.[month.key] || 0;
        const validAmount = isNaN(amount) ? 0 : amount;
        totals[subcategory.id] += validAmount;
      });
    });
    return totals;
  }, [reportData, subcategories, months]);

  const grandTotal = Object.values(subcategoryTotals).reduce((sum, total) => {
    const validTotal = isNaN(total) ? 0 : total;
    return sum + validTotal;
  }, 0);



  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedUser = activeUsers.find(u => u.id === selectedUserId);</parameter>

  // Print functionality
  const handlePrint = () => {
    // Create a hidden iframe for printing to avoid popup blockers
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-1000px';
    printFrame.style.left = '-1000px';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    
    document.body.appendChild(printFrame);
    
    const printContent = generatePrintContent();
    const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
    
    if (printDocument) {
      printDocument.open();
      printDocument.write(printContent);
      printDocument.close();
      
      // Wait for content to load, then print
      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    }
  };

  const generatePrintContent = (): string => {
    const currentDate = new Date().toLocaleDateString();
    const reportTitle = `Expense Report - ${selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name} - ${selectedCategoryId === 'all' ? 'All Categories' : selectedCategory?.name}`;
    const dateRangeText = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              color: #1f2937;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header .subtitle {
              color: #6b7280;
              font-size: 14px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .summary-card .value {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
            }
            .summary-card .label {
              font-size: 12px;
              color: #6b7280;
              margin-top: 5px;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .report-table th,
            .report-table td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              text-align: left;
            }
            .report-table th {
              background: #f3f4f6;
              font-weight: 600;
              text-align: center;
            }
            .report-table .subcategory-cell {
              font-weight: 500;
              background: #fafafa;
            }
            .report-table .amount-cell {
              text-align: right;
              font-weight: 500;
            }
            .report-table .total-row {
              background: #dbeafe;
              font-weight: bold;
            }
            .report-table .total-row td {
              border-top: 2px solid #3b82f6;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
             @page {
               size: landscape;
               margin: 0.5in;
             }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ExpenseTracker Report</h1>
            <div class="subtitle">
              ${reportTitle}<br>
              Period: ${dateRangeText} • Generated: ${currentDate}
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="value">${formatCurrency(grandTotal)}</div>
              <div class="label">Total Expenses</div>
            </div>
            <div class="summary-card">
              <div class="value">${subcategories.length}</div>
              <div class="label">Subcategories</div>
            </div>
            <div class="summary-card">
              <div class="value">${months.length}</div>
              <div class="label">Months</div>
            </div>
            <div class="summary-card">
              <div class="value">${selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name || 'N/A'}</div>
              <div class="label">${useCaseConfig.userLabelSingular} Filter</div>
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th>Subcategory</th>
                ${months.map(month => `<th>${month.label}</th>`).join('')}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${subcategories.map(subcategory => {
                const subcategoryTotal = subcategoryTotals[subcategory.id] || 0;
                return `
                  <tr>
                    <td class="subcategory-cell">
                      ${selectedCategoryId === 'all' ? 
                        `<strong>${subcategory.categoryName}</strong><br><span style="color: #6b7280;">${subcategory.name}</span>` : 
                        subcategory.name
                      }
                    </td>
                    ${months.map(month => {
                      const amount = reportData[subcategory.id]?.[month.key] || 0;
                      return `<td class="amount-cell">${amount > 0 ? formatCurrency(amount) : '-'}</td>`;
                    }).join('')}
                    <td class="amount-cell" style="background: #f3f4f6; font-weight: bold;">
                      ${subcategoryTotal > 0 ? formatCurrency(subcategoryTotal) : '-'}
                    </td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                ${months.map(month => 
                  `<td class="amount-cell">${formatCurrency(monthlyTotals[month.key] || 0)}</td>`
                ).join('')}
                <td class="amount-cell" style="background: #dbeafe;">${formatCurrency(grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by ExpenseTracker • ${new Date().toLocaleString()}</p>
            <p>This report contains ${filteredExpenses.length} expenses across ${subcategories.length} subcategories</p>
          </div>
        </body>
      </html>
    `;
  };

  // Handle cell click to show expense details
  const handleCellClick = (subcategoryId: string, monthKey: string) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return;

    const monthExpenses = filteredExpenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return expense.subcategoryId === subcategoryId && expenseMonth === monthKey;
    });

    if (monthExpenses.length === 0) return;

    const month = months.find(m => m.key === monthKey);
    setSelectedCell({
      subcategoryId,
      monthKey,
      subcategoryName: subcategory.name,
      categoryName: subcategory.categoryName,
      monthLabel: month?.label || monthKey,
      expenses: monthExpenses
    });
  };

  const handleEditExpense = (expense: Expense) => {
    // Close the modal first
    setSelectedCell(null);
    
    // Store current reports page state in sessionStorage for return navigation
    const reportsState = {
      selectedUserId,
      selectedCategoryId,
      startDate,
      endDate,
      returnTo: 'reports'
    };
    sessionStorage.setItem('expense-tracker-return-state', JSON.stringify(reportsState));
    
    // Navigate to expenses page with the expense ID and return flag
    setLocation(`/expenses?edit=${expense.id}&returnTo=reports`);
  };

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
        endDate,
        datePreset
      }
    };

    addSavedReport(newReport);
    setShowSaveReportModal(false);
    setReportName('');
    setReportDescription('');
  };

  const handleLoadReport = (report: SavedReport) => {
    setSelectedUserId(report.filters.selectedUserId);
    setSelectedCategoryId(report.filters.selectedCategoryId);
    setStartDate(report.filters.startDate);
    setEndDate(report.filters.endDate);
    setDatePreset(report.filters.datePreset || 'custom');
    
    // Update last used timestamp
    updateSavedReport(report.id, { lastUsed: new Date().toISOString() });
    setShowLoadReportModal(false);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this saved report?')) {
      deleteSavedReport(reportId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Expense Reports</h1>
          <div className="ml-auto flex gap-2">
            {savedReports.length > 0 && (
              <button
                onClick={() => setShowLoadReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                title="Load saved report"
              >
                <FolderOpen className="w-4 h-4" />
                Load Report
              </button>
            )}
            <button
              onClick={() => setShowSaveReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              title="Save current report filters"
            >
              <Save className="w-4 h-4" />
              Save Report
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              title="Print current report"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">Spreadsheet-style expense analysis by category and time period</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <label htmlFor="user-filter" className="text-xs font-medium text-gray-700">
              {useCaseConfig.userLabelSingular}:
            </label>
            <select
              id="user-filter"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{useCaseConfig.terminology.allUsers}</option>
              {activeUsers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <label htmlFor="category-filter" className="text-xs font-medium text-gray-700">
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="date-preset" className="text-xs font-medium text-gray-700">
              Period:
            </label>
            <select
              id="date-preset"
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value as DatePreset)}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {datePresetOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <label htmlFor="start-date" className="text-xs font-medium text-gray-700">
              From:
            </label>
            <input
              id="start-date"
              type="month"
              value={startDate}
              min={dateRange.minDate}
              max={dateRange.maxDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <label htmlFor="end-date" className="text-xs font-medium text-gray-700">
              To:
            </label>
            <input
              id="end-date"
              type="month"
              value={endDate}
              min={startDate}
              max={dateRange.maxDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>


        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatCurrency(grandTotal)}</div>
            <div className="text-xs text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{subcategories.length}</div>
            <div className="text-xs text-gray-600">Subcategories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{months.length}</div>
            <div className="text-xs text-gray-600">Months</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">{useCaseConfig.userLabelSingular} Filter</div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Report */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Expense Breakdown - {selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name} - {selectedCategoryId === 'all' ? 'All Categories' : selectedCategory?.name} ({startDate === endDate ? startDate : `${startDate} to ${endDate}`})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Subcategory
                </th>
                {months.map((month) => (
                  <th key={month.key} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                    {month.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 min-w-[100px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcategories.map((subcategory, index) => (
                <tr key={subcategory.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                    {selectedCategoryId === 'all' ? (
                      <div>
                        <div className="font-semibold text-xs">{subcategory.categoryName}</div>
                        <div className="text-gray-600 text-xs">{subcategory.name}</div>
                      </div>
                    ) : (
                      subcategory.name
                    )}
                  </td>
                  {months.map((month) => {
                    const amount = reportData[subcategory.id]?.[month.key] || 0;
                    return (
                      <td 
                        key={month.key} 
                        className={`px-2 py-2 whitespace-nowrap text-xs text-center ${
                          amount > 0 ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                        }`}
                        onClick={amount > 0 ? () => handleCellClick(subcategory.id, month.key) : undefined}
                        title={amount > 0 ? 'Click to view expense details' : ''}
                      >
                        {amount > 0 ? (
                          <span className="text-gray-900 font-medium hover:text-blue-600">
                            {formatCurrency(amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-center font-semibold bg-gray-100">
                    {subcategoryTotals[subcategory.id] > 0 ? (
                      <span className="text-gray-900">{formatCurrency(subcategoryTotals[subcategory.id])}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-blue-900 sticky left-0 bg-blue-50 z-10">
                  TOTAL
                </td>
                {months.map((month) => (
                  <td key={month.key} className="px-2 py-2 whitespace-nowrap text-xs text-center font-bold text-blue-900">
                    {formatCurrency(monthlyTotals[month.key] || 0)}
                  </td>
                ))}
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center font-bold text-blue-900 bg-blue-100">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {subcategories.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-xs text-gray-600">
            No expenses found for the selected filters. Try selecting a different category or year.
          </p>
        </div>
      )}

      {/* Expense Details Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCategoryId === 'all' ? `${selectedCell.categoryName} - ` : ''}{selectedCell.subcategoryName} • {selectedCell.monthLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedCell.expenses.length} expense{selectedCell.expenses.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    {formatCurrency(selectedCell.expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </span>
                </div>
              </div>

              {/* Expenses List */}
              <div className="space-y-2">
                {selectedCell.expenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense, index) => (
                    <div
                      key={expense.id || index}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {expense.description}
                            </h4>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {expense.date}
                            </span>
                          </div>
                          {expense.notes && (
                            <p className="text-xs text-gray-600 mb-2">
                              {expense.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>👤 {users.find(u => u.id === expense.userId)?.name || 'Unknown User'}</span>
                            {expense.storeName && (
                              <span>🏪 {expense.storeName}</span>
                            )}
                            {expense.storeLocation && (
                              <span>📍 {expense.storeLocation}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-200"
                              title="Edit this expense"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Report Modal */}
      {showSaveReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Save Report</h3>
              </div>
              <button
                onClick={() => setShowSaveReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Monthly Team Expenses"
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief description of this report..."
                  rows={3}
                  maxLength={200}
                />
              </div>
              
              {/* Current Filters Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Filters:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• {useCaseConfig.userLabelSingular}: {selectedUserId === 'all' ? useCaseConfig.terminology.allUsers : selectedUser?.name}</div>
                  <div>• Category: {selectedCategoryId === 'all' ? 'All Categories' : selectedCategory?.name}</div>
                  <div>• Period: {startDate === endDate ? startDate : `${startDate} to ${endDate}`}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSaveReportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReport}
                disabled={!reportName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Report Modal */}
      {showLoadReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Load Saved Report</h3>
              </div>
              <button
                onClick={() => setShowLoadReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {savedReports.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Saved Reports</h4>
                  <p className="text-gray-500">Save your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports
                    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                    .map(report => {
                      const reportUser = report.filters.selectedUserId === 'all' ? null : activeUsers.find(u => u.id === report.filters.selectedUserId);
                      const reportCategory = report.filters.selectedCategoryId === 'all' ? null : categories.find(c => c.id === report.filters.selectedCategoryId);
                      
                      return (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <h4 className="font-medium text-gray-900 truncate">{report.name}</h4>
                              </div>
                              
                              {report.description && (
                                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                              )}
                              
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>• {useCaseConfig.userLabelSingular}: {reportUser?.name || useCaseConfig.terminology.allUsers}</div>
                                <div>• Category: {reportCategory?.name || 'All Categories'}</div>
                                <div>• Period: {report.filters.startDate === report.filters.endDate ? report.filters.startDate : `${report.filters.startDate} to ${report.filters.endDate}`}</div>
                                <div>• Last used: {new Date(report.lastUsed).toLocaleDateString()}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                              <button
                                onClick={() => handleLoadReport(report)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Load this report"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete this report"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowLoadReportModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};