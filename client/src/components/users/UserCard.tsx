import React from 'react';
import { User, Category } from '../../types';
import { Edit2, Trash2, Star, AtSign, Mail } from 'lucide-react';

interface UserCardProps {
  user: User;
  categories: Category[];
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  categories,
  users,
  onEdit,
  onDelete
}) => {
  const defaultCategory = categories.find(c => c.id === user.defaultCategoryId);
  const defaultSubcategory = defaultCategory?.subcategories.find(s => s.id === user.defaultSubcategoryId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-white text-lg font-semibold`}>
            {user.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{user.name}</h3>
            <div className="text-sm text-slate-500 space-y-1">
              <div className="flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                {user.username}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              <div className="text-xs text-slate-400">ID: {user.id}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={users.length <= 1}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Default Settings Display */}
      {(user.defaultCategoryId || user.defaultStoreLocation) && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Default Settings</span>
          </div>
          <div className="space-y-1 text-xs text-emerald-700">
            {defaultCategory && (
              <div>Category: {defaultCategory.name}{defaultSubcategory && ` • ${defaultSubcategory.name}`}</div>
            )}
            {user.defaultStoreLocation && (
              <div>Location: {user.defaultStoreLocation}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};