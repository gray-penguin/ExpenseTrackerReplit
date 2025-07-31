import React, { useState } from 'react';
import { Category, Subcategory } from '../types';
import { IconSelector } from './IconSelector';
import { Plus, Edit2, Trash2, Save, X, Tag, Folder, Palette } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

interface SubcategoryFormData {
  name: string;
}

const colorOptions = [
  'text-red-600', 'text-orange-600', 'text-amber-600', 'text-yellow-600',
  'text-lime-600', 'text-green-600', 'text-emerald-600', 'text-teal-600',
  'text-cyan-600', 'text-sky-600', 'text-blue-600', 'text-indigo-600',
  'text-violet-600', 'text-purple-600', 'text-fuchsia-600', 'text-pink-600',
  'text-rose-600', 'text-slate-600'
];

// Helper function to get next available numeric ID
const getNextCategoryId = (categories: Category[]): string => {
  const existingIds = categories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString();
};

const getNextSubcategoryId = (categories: Category[]): string => {
  const allSubcategoryIds = categories.flatMap(cat => 
    cat.subcategories.map(sub => parseInt(sub.id))
  ).filter(id => !isNaN(id));
  
  const maxId = allSubcategoryIds.length > 0 ? Math.max(...allSubcategoryIds) : 0;
  return (maxId + 1).toString();
};

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onUpdateCategories
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<{ categoryId: string; subcategory: Subcategory | null }>({ categoryId: '', subcategory: null });
  const [showAddSubcategory, setShowAddSubcategory] = useState<string>('');

  const [showIconSelector, setShowIconSelector] = useState(false);

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    icon: 'Tag',
    color: 'text-blue-600'
  });

  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormData>({
    name: ''
  });

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', icon: 'Tag', color: 'text-blue-600' });
    setEditingCategory(null);
    setShowAddCategory(false);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ name: '' });
    setEditingSubcategory({ categoryId: '', subcategory: null });
    setShowAddSubcategory('');
  };



  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) return;

    const newCategory: Category = {
      id: getNextCategoryId(categories),
      name: categoryForm.name.trim(),
      icon: categoryForm.icon,
      color: categoryForm.color,
      subcategories: []
    };

    onUpdateCategories([...categories, newCategory]);
    resetCategoryForm();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryForm.name.trim()) return;

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: categoryForm.name.trim(),
            icon: categoryForm.icon,
            color: categoryForm.color
          }
        : cat
    );

    onUpdateCategories(updatedCategories);
    resetCategoryForm();
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      onUpdateCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const handleAddSubcategory = (categoryId: string) => {
    if (!subcategoryForm.name.trim()) return;

    const newSubcategory: Subcategory = {
      id: getNextSubcategoryId(categories),
      name: subcategoryForm.name.trim(),
      categoryId
    };

    const updatedCategories = categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    );

    onUpdateCategories(updatedCategories);
    resetSubcategoryForm();
  };

  const handleEditSubcategory = (categoryId: string, subcategory: Subcategory) => {
    setEditingSubcategory({ categoryId, subcategory });
    setSubcategoryForm({ name: subcategory.name });
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory.subcategory || !subcategoryForm.name.trim()) return;

    const updatedCategories = categories.map(cat =>
      cat.id === editingSubcategory.categoryId
        ? {
            ...cat,
            subcategories: cat.subcategories.map(sub =>
              sub.id === editingSubcategory.subcategory!.id
                ? { ...sub, name: subcategoryForm.name.trim() }
                : sub
            )
          }
        : cat
    );

    onUpdateCategories(updatedCategories);
    resetSubcategoryForm();
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      const updatedCategories = categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) }
          : cat
      );

      onUpdateCategories(updatedCategories);
    }
  };

  const handleIconSelect = (iconName: string) => {
    setCategoryForm(prev => ({ ...prev, icon: iconName }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Category Management</h2>
          <p className="text-slate-500 mt-1">Organize your expenses with custom categories and subcategories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Add/Edit Category Form */}
      {(showAddCategory || editingCategory) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 flex items-center gap-2">
                    {(() => {
                      const IconComponent = Icons[categoryForm.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                      return <IconComponent className="w-5 h-5 text-slate-600" />;
                    })()}
                    <span className="text-sm text-slate-600">{categoryForm.icon}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconSelector(true)}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Browse
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      categoryForm.color === color ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200'
                    } ${color.replace('text-', 'bg-').replace('-600', '-500')} hover:scale-110 transition-transform`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center ${categoryForm.color}`}>
                {(() => {
                  const IconComponent = Icons[categoryForm.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                  return <IconComponent className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{categoryForm.name || 'Category Name'}</div>
                <div className="text-sm text-slate-500">{categoryForm.icon} • {categoryForm.color}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              disabled={!categoryForm.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {editingCategory ? 'Update' : 'Add'} Category
            </button>
            <button
              onClick={resetCategoryForm}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => {
          const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          
          return (
            <div key={category.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center ${category.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-500">
                      {category.subcategories.length} subcategories • {category.icon} • ID: {category.id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddSubcategory(category.id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Add subcategory"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Subcategory Form */}
              {showAddSubcategory === category.id && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter subcategory name"
                    />
                    <button
                      onClick={() => handleAddSubcategory(category.id)}
                      disabled={!subcategoryForm.name.trim()}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      onClick={resetSubcategoryForm}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Subcategory Form */}
              {editingSubcategory.categoryId === category.id && editingSubcategory.subcategory && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter subcategory name"
                    />
                    <button
                      onClick={handleUpdateSubcategory}
                      disabled={!subcategoryForm.name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update
                    </button>
                    <button
                      onClick={resetSubcategoryForm}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Subcategories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.subcategories.sort((a, b) => a.name.localeCompare(b.name)).map(subcategory => (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{subcategory.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditSubcategory(category.id, subcategory)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Edit subcategory"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete subcategory"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {category.subcategories.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No subcategories yet</p>
                  <button
                    onClick={() => setShowAddSubcategory(category.id)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-1"
                  >
                    Add the first one
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No categories yet</h3>
          <p className="text-slate-500 mb-4">Create your first category to start organizing expenses</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Category
            </button>
          </div>
        </div>
      )}



      {/* Icon Selector Modal */}
      {showIconSelector && (
        <IconSelector
          selectedIcon={categoryForm.icon}
          onIconSelect={handleIconSelect}
          onClose={() => setShowIconSelector(false)}
        />
      )}
    </div>
  );
};