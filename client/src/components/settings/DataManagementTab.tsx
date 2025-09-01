import React, { useState } from 'react';
import { Category } from '../../types';
import { Trash2, AlertTriangle, Database, FileX } from 'lucide-react';

interface DataManagementTabProps {
  onClearAllExpenses: () => void;
  expenseCount: number;
  onClearAllCategories: () => void;
  categories: Category[];
  onLogout: () => void;
}

export const DataManagementTab: React.FC<DataManagementTabProps> = ({
  onClearAllExpenses,
  expenseCount,
  onClearAllCategories,
  categories,
  onLogout
}) => {
  const [showClearExpensesConfirm, setShowClearExpensesConfirm] = useState(false);
  const [showClearCategoriesConfirm, setShowClearCategoriesConfirm] = useState(false);

  const handleClearExpenses = () => {
    onClearAllExpenses();
    setShowClearExpensesConfirm(false);
  };

  const handleClearCategories = () => {
    onClearAllCategories();
    setShowClearCategoriesConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Clear Expenses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <FileX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Clear All Expenses</h3>
            <p className="text-slate-500">Remove all expense records from the application</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Warning: This action cannot be undone</h4>
              <p className="text-red-800 text-sm mt-1">
                This will permanently delete all {expenseCount} expenses. Make sure to create a backup first.
              </p>
            </div>
          </div>
        </div>

        {!showClearExpensesConfirm ? (
          <button
            onClick={() => setShowClearExpensesConfirm(true)}
            disabled={expenseCount === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All Expenses ({expenseCount})
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleClearExpenses}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Yes, Delete All Expenses
            </button>
            <button
              onClick={() => setShowClearExpensesConfirm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Clear Categories */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Clear All Categories</h3>
            <p className="text-slate-500">Remove all categories and subcategories</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Warning: This will also delete all expenses</h4>
              <p className="text-orange-800 text-sm mt-1">
                Deleting categories will also remove all {expenseCount} expenses since they depend on categories.
              </p>
            </div>
          </div>
        </div>

        {!showClearCategoriesConfirm ? (
          <button
            onClick={() => setShowClearCategoriesConfirm(true)}
            disabled={categories.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All Categories ({categories.length})
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleClearCategories}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Yes, Delete All Categories & Expenses
            </button>
            <button
              onClick={() => setShowClearCategoriesConfirm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};