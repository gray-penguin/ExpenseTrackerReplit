import React from 'react';
import { User, Expense } from '../../types';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { getUseCaseConfig } from '../../utils/useCaseConfig';

interface ExpenseSummaryProps {
  filteredExpenses: Expense[];
  totalExpenses: Expense[];
  users: User[];
  hasActiveFilters: boolean;
  dateRangeLabel?: string;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  filteredExpenses,
  totalExpenses,
  users,
  hasActiveFilters,
  dateRangeLabel
}) => {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

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

  return (
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
                ? `${filteredExpenses.length} of ${totalExpenses.length} expenses shown`
                : `${filteredExpenses.length} total expenses`
              }
              {dateRangeLabel && (
                <span> • {dateRangeLabel}</span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatCurrency(filteredTotal)}</div>
          {hasActiveFilters && totalExpenses.length > 0 && (
            <div className="text-emerald-100 text-sm">
              {((filteredTotal / totalExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1)}% of total
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
  );
};