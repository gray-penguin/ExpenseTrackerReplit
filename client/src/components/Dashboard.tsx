import React, { useState } from 'react';
import { User, Category, Expense } from '../types';
import { StatsCards } from './dashboard/StatsCards';
import { CategoryBreakdown } from './dashboard/CategoryBreakdown';
import { SubcategoryBreakdown } from './dashboard/SubcategoryBreakdown';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  categories: Category[];
  selectedUser: User | null;
  onNavigateToExpenses?: (categoryId: string, subcategoryId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses, users, categories, selectedUser, onNavigateToExpenses }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
      <StatsCards expenses={expenses} selectedUser={selectedUser} />

      {/* Category Breakdown */}
      <CategoryBreakdown
        expenses={expenses}
        categories={categories}
        selectedUser={selectedUser}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
      />

      {/* Subcategory Breakdown */}
      <SubcategoryBreakdown
        expenses={expenses}
        categories={categories}
        selectedUser={selectedUser}
        selectedCategoryId={selectedCategoryId}
        onSubcategoryClick={handleSubcategoryClick}
      />
    </div>
  );
};