import React, { useState } from 'react';
import { User, Category, Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  categories: Category[];
  selectedUser: User | null;
  onNavigateToExpenses?: (categoryId: string, subcategoryId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses, users, categories, selectedUser, onNavigateToExpenses }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Helper function to format date to YYYY-MM-DD
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredExpenses = selectedUser 
    ? expenses.filter(expense => expense.userId === selectedUser.id)
    : expenses;

  // Calculate date range for filtered expenses
  const getDateRange = () => {
    if (filteredExpenses.length === 0) return null;
    
    const dates = filteredExpenses.map(expense => new Date(expense.date + 'T00:00:00'));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    };
    
    // If same date, show just one date
    if (minDate.getTime() === maxDate.getTime()) {
      return formatDate(minDate);
    }
    
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const currentYear = new Date().getFullYear().toString();
  const currentYearExpenses = filteredExpenses.filter(expense => expense.date.startsWith(currentYear));
  const currentYearTotal = currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = filteredExpenses.filter(expense => expense.date.startsWith(currentMonth));
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthStr = previousMonth.toISOString().slice(0, 7);
  const previousMonthExpenses = filteredExpenses.filter(expense => expense.date.startsWith(previousMonthStr));
  const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyChange = previousMonthTotal > 0 
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
    : 0;

  const categoryTotals = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      category,
      total,
      percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
      count: categoryExpenses.length
    };
  }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);

  // Calculate subcategory totals for selected category
  const getSubcategoryTotals = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];

    const categoryExpenses = filteredExpenses.filter(expense => expense.categoryId === categoryId);
    const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return category.subcategories.map(subcategory => {
      const subcategoryExpenses = categoryExpenses.filter(expense => expense.subcategoryId === subcategory.id);
      const total = subcategoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        subcategory,
        total,
        percentage: categoryTotal > 0 ? (total / categoryTotal) * 100 : 0,
        count: subcategoryExpenses.length
      };
    }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);
  };

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;
  const subcategoryTotals = selectedCategoryId ? getSubcategoryTotals(selectedCategoryId) : [];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(selectedCategoryId === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    console.log('Dashboard handleSubcategoryClick called with:', { categoryId, subcategoryId });
    if (onNavigateToExpenses) {
      console.log('Calling onNavigateToExpenses function');
      onNavigateToExpenses(categoryId, subcategoryId);
    } else {
      console.log('onNavigateToExpenses is not provided');
    }
  };
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
          <div className="text-emerald-100 text-sm">
            {selectedUser ? `${selectedUser.name}'s spending` : 'All users combined'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="text-right">
              <p className="text-slate-500 text-sm">This Year</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(currentYearTotal)}</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm">
            {currentYearExpenses.length} transaction{currentYearExpenses.length !== 1 ? 's' : ''} in {currentYear}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div className="text-right">
              <p className="text-slate-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(currentMonthTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {monthlyChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {Math.abs(monthlyChange).toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{filteredExpenses.length}</p>
            </div>
          </div>
          {getDateRange() && (
            <div className="text-slate-500 text-sm">
              <span className="font-medium">Period:</span> {getDateRange()}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Spending by Category</h3>
        <div className="space-y-4">
          {categoryTotals.map(({ category, total, percentage, count }) => {
            const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            const isSelected = selectedCategoryId === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-slate-50 ${
                  isSelected ? 'bg-emerald-50 border border-emerald-200' : 'hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center ${category.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 text-left">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
            <h4 className="text-emerald-100 text-sm font-medium mb-3 uppercase tracking-wide">Spending by {useCaseConfig.userLabelSingular}</h4>
                        isSelected ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div 
                        className={\`h-2 rounded-full transition-all duration-500 ${
                          isSelected ? 'bg-emerald-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: \`${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500">{count} transactions</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Spending by Subcategory
          {selectedCategory && (
            <span className="text-base font-normal text-slate-500 ml-2">
              • {selectedCategory.name}
            </span>
          )}
        </h3>
        
        {!selectedCategoryId ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChevronRight className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">Click above to show</h4>
            <p className="text-slate-500">
              Select a category above to view its subcategory breakdown
            </p>
          </div>
        ) : subcategoryTotals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No expenses found</h4>
            <p className="text-slate-500">
              No expenses in {selectedCategory?.name} for the selected period
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Click to view details
              </p>
              <span className="text-xs text-slate-400">
                {subcategoryTotals.length} subcategories
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
            {subcategoryTotals.map(({ subcategory, total, percentage, count }) => {
              const IconComponent = selectedCategory && Icons[selectedCategory.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              
              return (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(selectedCategoryId!, subcategory.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group cursor-pointer hover:shadow-sm border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {IconComponent && selectedCategory && (
                      <div className={\`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${selectedCategory.color} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 block truncate group-hover:text-emerald-600 transition-colors">{subcategory.name}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 group-hover:bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: \`${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{count} transactions</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};