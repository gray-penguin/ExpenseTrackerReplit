import { useState } from 'react';
import { User, Category } from '../types';
import { Plus } from 'lucide-react';
import { CategoryManager } from '../components/CategoryManager';
import { useExpenseData } from '../hooks/useExpenseData';

export function CategoriesPage() {
  const { categories, setCategories } = useExpenseData();

  const handleUpdateCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
  };

  return (
    <div className="space-y-8">
      {/* Category Manager */}
      <CategoryManager
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
      />
    </div>
  );
}