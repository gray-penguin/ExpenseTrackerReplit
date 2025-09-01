import React, { useState } from 'react';
import { User, Category } from '../types';
import { UseCaseConfig } from '../utils/useCaseConfig';
import { Plus, Users } from 'lucide-react';
import { UserForm } from './users/UserForm';
import { UserCard } from './users/UserCard';

interface UserManagerProps {
  users: User[];
  categories: Category[];
  onUpdateUsers: (users: User[]) => void;
  useCaseConfig: UseCaseConfig;
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
  onUpdateUsers,
  useCaseConfig
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

  const handleUserFormChange = (updates: Partial<UserFormData>) => {
    setUserForm(prev => ({ ...prev, ...updates }));
    
    // Auto-generate fields when name changes
    if (updates.name !== undefined) {
      const name = updates.name;
      setUserForm(prev => ({
        ...prev,
        name,
        avatar: prev.avatar || generateInitials(name),
        username: prev.username || generateUsername(name, users),
        email: prev.email || generateEmail(name, users)
      }));
    }
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
      alert(`Cannot delete the last ${useCaseConfig.terminology.user}. At least one ${useCaseConfig.terminology.user} must exist.`);
      return;
    }

    if (confirm(`Are you sure you want to delete this ${useCaseConfig.terminology.user}? All their expenses will also be deleted.`)) {
      onUpdateUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{useCaseConfig.terminology.userManagement}</h2>
          <p className="text-slate-500 mt-1">Manage {useCaseConfig.terminology.users} and their default expense settings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {useCaseConfig.terminology.addUser}
          </button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {(showAddUser || editingUser) && (
        <UserForm
          userForm={userForm}
          onUserFormChange={handleUserFormChange}
          editingUser={editingUser}
          users={users}
          categories={categories}
          useCaseConfig={useCaseConfig}
          onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          onCancel={resetUserForm}
        />
      )}

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => {
          return (
            <UserCard
              key={user.id}
              user={user}
              categories={categories}
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No users yet</h3>
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