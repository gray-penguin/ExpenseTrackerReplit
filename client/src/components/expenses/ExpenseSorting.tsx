import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUseCaseConfig } from '../../utils/useCaseConfig';

export type SortField = 'date' | 'amount' | 'description' | 'user' | 'category';
export type SortOrder = 'asc' | 'desc';

interface ExpenseSortingProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  expenseCount: number;
}

export const ExpenseSorting: React.FC<ExpenseSortingProps> = ({
  sortBy,
  sortOrder,
  onSort,
  expenseCount
}) => {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

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
      user: useCaseConfig.userLabelSingular,
      category: 'Category'
    };
    return labels[field];
  };

  if (expenseCount === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 font-medium">Sort by:</span>
        <div className="flex items-center gap-1">
          {(['date', 'amount', 'description', 'user', 'category'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => onSort(field)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === field
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {getSortLabel(field)}
              {getSortIcon(field)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};