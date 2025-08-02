import React, { useState } from 'react';
import { User, Category } from '../types';

import { Plus, Edit2, Trash2, Save, X, Users, User as UserIcon, Star, Tag, MapPin, AtSign, Mail } from 'lucide-react';
import * as Icons from 'lucide-react';

interface UserManagerProps {
  users: User[];
  categories: Category[];
  onUpdateUsers: (users: User[]) => void;
}

interface UserFormData {
  name: string;
  username: string;
  email: string;
  avatar: string;
  color: string;
  defaultCategoryId: string;
  defaultSubcategoryId: string;
  defaultStoreLocation: string;
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

const generateUsername = (name: string, existingUsers: User[]): string => {
  // Generate base username from name
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  
  let username = baseUsername;
  let counter = 1;
  
  // Check if username already exists
  while (existingUsers.some(user => user.username === username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};

const generateEmail = (name: string, existingUsers: User[]): string => {
  // Generate base email from name
  const baseEmail = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  
  let email = `${baseEmail}@example.com`;
  let counter = 1;
  
  // Check if email already exists
  while (existingUsers.some(user => user.email === email)) {
    email = `${baseEmail}${counter}@example.com`;
    counter++;
  }
  
  return email;
};

// Helper function to get next available numeric ID
const getNextUserId = (users: User[]): string => {
  const existingIds = users.map(user => parseInt(user.id)).filter(id => !isNaN(id));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString();
};

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  categories,
  onUpdateUsers
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);


  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    username: '',
    email: '',
    avatar: '',
    color: 'bg-blue-500',
    defaultCategoryId: '',
    defaultSubcategoryId: '',
    defaultStoreLocation: ''
  });

  const selectedCategory = categories.find(c => c.id === userForm.defaultCategoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const resetUserForm = () => {
    setUserForm({ 
      name: '', 
      username: '',
      email: '',
      avatar: '', 
      color: 'bg-blue-500',
      defaultCategoryId: '',
      defaultSubcategoryId: '',
      defaultStoreLocation: ''
    });
    setEditingUser(null);
    setShowAddUser(false);
  };



  const handleAddUser = () => {
    if (!userForm.name.trim() || !userForm.username.trim() || !userForm.email.trim()) {
      alert('Please fill in all required fields (Name, Username, Email)');
      return;
    }

    // Check if username already exists
    if (users.some(user => user.username === userForm.username.trim())) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    // Check if email already exists
    if (users.some(user => user.email === userForm.email.trim())) {
      alert('Email already exists. Please choose a different email.');
      return;
    }

    const newUser: User = {
      id: getNextUserId(users),
      name: userForm.name.trim(),
      username: userForm.username.trim(),
      email: userForm.email.trim(),
      avatar: userForm.avatar || generateInitials(userForm.name.trim()),
      color: userForm.color,
      defaultCategoryId: userForm.defaultCategoryId || undefined,
      defaultSubcategoryId: userForm.defaultSubcategoryId || undefined,
      defaultStoreLocation: userForm.defaultStoreLocation || undefined
    };

    onUpdateUsers([...users, newUser]);
    resetUserForm();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      defaultCategoryId: user.defaultCategoryId || '',
      defaultSubcategoryId: user.defaultSubcategoryId || '',
      defaultStoreLocation: user.defaultStoreLocation || ''
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser || !userForm.name.trim() || !userForm.username.trim() || !userForm.email.trim()) return;

    // Check if username already exists (excluding current user)
    if (users.some(user => user.id !== editingUser.id && user.username === userForm.username.trim())) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    // Check if email already exists (excluding current user)
    if (users.some(user => user.id !== editingUser.id && user.email === userForm.email.trim())) {
      alert('Email already exists. Please choose a different email.');
      return;
    }

    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? {
            ...user,
            name: userForm.name.trim(),
            username: userForm.username.trim(),
            email: userForm.email.trim(),
            avatar: userForm.avatar || generateInitials(userForm.name.trim()),
            color: userForm.color,
            defaultCategoryId: userForm.defaultCategoryId || undefined,
            defaultSubcategoryId: userForm.defaultSubcategoryId || undefined,
            defaultStoreLocation: userForm.defaultStoreLocation || undefined
          }
        : user
    );

    onUpdateUsers(updatedUsers);
    resetUserForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last user. At least one user must exist.');
      return;
    }

    if (confirm('Are you sure you want to delete this user? All their expenses will also be deleted.')) {
      onUpdateUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleNameChange = (name: string) => {
    setUserForm(prev => ({
      ...prev,
      name,
      avatar: prev.avatar || generateInitials(name),
      username: prev.username || generateUsername(name, users),
      email: prev.email || generateEmail(name, users)
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setUserForm(prev => ({
      ...prev,
      defaultCategoryId: categoryId,
      defaultSubcategoryId: '' // Reset subcategory when category changes
    }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 mt-1">Manage users and their default expense settings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {(showAddUser || editingUser) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
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
                      onChange={(e) => handleNameChange(e.target.value)}
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
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
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
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value.toLowerCase() }))}
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
                    onChange={(e) => setUserForm(prev => ({ ...prev, avatar: e.target.value.toUpperCase().slice(0, 2) }))}
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
                        onClick={() => setUserForm(prev => ({ ...prev, color }))}
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
                    onChange={(e) => setUserForm(prev => ({ ...prev, defaultSubcategoryId: e.target.value }))}
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
                      onChange={(e) => setUserForm(prev => ({ ...prev, defaultStoreLocation: e.target.value }))}
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
                {editingUser ? 'Update' : 'Add'} {useCaseConfig.userLabelSingular}
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
              onClick={editingUser ? handleUpdateUser : handleAddUser}
              disabled={!userForm.name.trim() || !userForm.username.trim() || !userForm.email.trim() || 
                       !isUsernameValid(userForm.username) || !isUsernameAvailable(userForm.username) ||
                       !isEmailValid(userForm.email) || !isEmailAvailable(userForm.email)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {editingUser ? 'Update' : 'Add'} User
            </button>
            <button
              type="button"
              onClick={resetUserForm}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => {
          const defaultCategory = categories.find(c => c.id === user.defaultCategoryId);
          const defaultSubcategory = defaultCategory?.subcategories.find(s => s.id === user.defaultSubcategoryId);
          
          return (
            <div key={user.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200 group">
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
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
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
        })}
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No {useCaseConfig.terminology.users} yet</h3>
          <p className="text-slate-500 mb-4">Add your first {useCaseConfig.terminology.user} to start tracking expenses</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {useCaseConfig.terminology.addUser}
            </button>
          </div>
        </div>
      )}


    </div>
  );
};