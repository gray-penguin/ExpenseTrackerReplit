import React from 'react';
import { User, Category, Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ChevronRight, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';

interface SubcategoryBreakdownProps {
  expenses: Expense[];
  categories: Category[];
  selectedUser: User | null;
  selectedCategoryId: string | null;
  onSubcategoryClick: (categoryId: string, subcategoryId: string) => void;
}

export const SubcategoryBreakdown: React.FC<SubcategoryBreakdownProps> = ({
  expenses,
  categories,
  selectedUser,
  selectedCategoryId,
  onSubcategoryClick
}) => {
  const filteredExpenses = selectedUser 
    ? expenses.filter(expense => expense.userId === selectedUser.id)
    : expenses;

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

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

  const subcategoryTotals = selectedCategoryId ? getSubcategoryTotals(selectedCategoryId) : [];

  return (
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
                  onClick={() => onSubcategoryClick(selectedCategoryId!, subcategory.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group cursor-pointer hover:shadow-sm border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${selectedCategory?.color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
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
                            style={{ width: `${percentage}%` }}
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
  );
};