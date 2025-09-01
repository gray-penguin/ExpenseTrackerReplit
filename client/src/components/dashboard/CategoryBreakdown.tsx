import React from 'react';
import { User, Category, Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryBreakdownProps {
  expenses: Expense[];
  categories: Category[];
  selectedUser: User | null;
  selectedCategoryId: string | null;
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  expenses,
  categories,
  selectedUser,
  selectedCategoryId,
  onCategoryClick
}) => {
  const filteredExpenses = selectedUser 
    ? expenses.filter(expense => expense.userId === selectedUser.id)
    : expenses;

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Spending by Category</h3>
      <div className="space-y-4">
        {categoryTotals.map(({ category, total, percentage, count }) => {
          const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
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
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isSelected ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-emerald-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
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
  );
};