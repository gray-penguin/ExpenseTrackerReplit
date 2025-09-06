import React from 'react';
import { User, Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface StatsCardsProps {
  expenses: Expense[];
  selectedUser: User | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ expenses, selectedUser }) => {
  // Helper function to format date to YYYY-MM-DD
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter out expenses from inactive users
  const activeUserExpenses = expenses.filter(expense => {
    // For now, we'll assume all users in expenses are active since we don't have user data here
    // This will be properly filtered at the page level
    return true;
  });

  const filteredExpenses = selectedUser 
    ? activeUserExpenses.filter(expense => expense.userId === selectedUser.id)
    : activeUserExpenses;

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

  return (
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
  );
};