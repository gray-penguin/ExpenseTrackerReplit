import React from 'react';
import { User, Category } from '../../types';
import { UseCaseConfig } from '../../utils/useCaseConfig';
import { Save, X, User as UserIcon, Star, Tag, MapPin, AtSign, Mail } from 'lucide-react';

interface UserFormProps {
  userForm: {
    name: string;
    username: string;
    email: string;
    avatar: string;
    color: string;
    defaultCategoryId: string;
    defaultSubcategoryId: string;
    defaultStoreLocation: string;
  };
  onUserFormChange: (updates: any) => void;
  editingUser: User | null;
  users: User[];
  categories: Category[];
  useCaseConfig: UseCaseConfig;
  onSubmit: () => void;
  onCancel: () => void;
}

const colorOptions = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
  'bg-rose-500', 'bg-slate-500'
];

const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const UserForm: React.FC<UserFormProps> = ({
  userForm,
  onUserFormChange,
  editingUser,
  users,
  categories,
  useCaseConfig,
  onSubmit,
  onCancel
}) => {
  const selectedCategory = categories.find(c => c.id === userForm.defaultCategoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const handleCategoryChange = (categoryId: string) => {
    onUserFormChange({
      defaultCategoryId: categoryId,
      defaultSubcategoryId: '' // Reset subcategory when category changes
    });
  };

  const isUsernameValid = (username: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const isUsernameAvailable = (username: string): boolean => {
    if (editingUser) {
      return !users.some(user => user.id !== editingUser.id && user.username === username);
    }
    return !users.some(user => user.username === username);
  };

  const isEmailValid = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isEmailAvailable = (email: string): boolean => {
    if (editingUser) {
      return !users.some(user => user.id !== editingUser.id && user.email === email);
    }
    return !users.some(user => user.email === email);
  };

  const isFormValid = userForm.name.trim() && 
                     userForm.username.trim() && 
                     userForm.email.trim() && 
                     isUsernameValid(userForm.username) && 
                     isUsernameAvailable(userForm.username) &&
                     isEmailValid(userForm.email) && 
                     isEmailAvailable(userForm.email);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {editingUser ? useCaseConfig.terminology.editUser : useCaseConfig.terminology.addUser}
      </h3>
      
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => onUserFormChange({ name: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter full name"
                  required
                />
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
              <div className="relative">
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => onUserFormChange({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    userForm.username && !isUsernameValid(userForm.username) 
                      ? 'border-red-300 bg-red-50' 
                      : userForm.username && !isUsernameAvailable(userForm.username)
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-300'
                  }`}
                  placeholder="username123"
                  maxLength={20}
                  required
                />
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {userForm.username && !isUsernameValid(userForm.username) && (
                <p className="text-xs text-red-600 mt-1">Username must be 3-20 characters, letters, numbers, and underscores only</p>
              )}
              {userForm.username && isUsernameValid(userForm.username) && !isUsernameAvailable(userForm.username) && (
                <p className="text-xs text-amber-600 mt-1">Username already taken</p>
              )}
              {userForm.username && isUsernameValid(userForm.username) && isUsernameAvailable(userForm.username) && (
                <p className="text-xs text-green-600 mt-1">Username available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => onUserFormChange({ email: e.target.value.toLowerCase() })}
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    userForm.email && !isEmailValid(userForm.email) 
                      ? 'border-red-300 bg-red-50' 
                      : userForm.email && !isEmailAvailable(userForm.email)
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-300'
                  }`}
                  placeholder="user@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {userForm.email && !isEmailValid(userForm.email) && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
              )}
              {userForm.email && isEmailValid(userForm.email) && !isEmailAvailable(userForm.email) && (
                <p className="text-xs text-amber-600 mt-1">Email already taken</p>
              )}
              {userForm.email && isEmailValid(userForm.email) && isEmailAvailable(userForm.email) && (
                <p className="text-xs text-green-600 mt-1">Email available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar Initials</label>
              <input
                type="text"
                value={userForm.avatar}
                onChange={(e) => onUserFormChange({ avatar: e.target.value.toUpperCase().slice(0, 2) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Auto-generated from name"
                maxLength={2}
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate from name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar Color</label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onUserFormChange({ color })}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      userForm.color === color ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200'
                    } ${color} hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Default Expense Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Category</label>
              <div className="relative">
                <select
                  value={userForm.defaultCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                >
                  <option value="">No default</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Subcategory</label>
              <select
                value={userForm.defaultSubcategoryId}
                onChange={(e) => onUserFormChange({ defaultSubcategoryId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                disabled={!userForm.defaultCategoryId}
              >
                <option value="">No default</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Default Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={userForm.defaultStoreLocation}
                  onChange={(e) => onUserFormChange({ defaultStoreLocation: e.target.value })}
                  className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Downtown"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            These defaults will be automatically applied when this user creates new expenses
          </p>
        </div>

        {/* Preview */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${userForm.color} flex items-center justify-center text-white text-sm font-semibold`}>
              {userForm.avatar || generateInitials(userForm.name)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900">{userForm.name || 'User Name'}</div>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <AtSign className="w-3 h-3" />
                  {userForm.username || 'username'}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {userForm.email || 'email@example.com'}
                </div>
              </div>
              {(userForm.defaultCategoryId || userForm.defaultStoreLocation) && (
                <div className="text-xs text-slate-600 mt-1">
                  Defaults: {userForm.defaultCategoryId && selectedCategory?.name}
                  {userForm.defaultStoreLocation && ` • ${userForm.defaultStoreLocation}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isFormValid}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {editingUser ? 'Update' : 'Add'} {useCaseConfig.userLabelSingular}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};