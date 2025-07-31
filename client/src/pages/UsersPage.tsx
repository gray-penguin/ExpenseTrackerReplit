import { useState } from 'react';
import { User } from '../types';
import { Plus } from 'lucide-react';
import { UserManager } from '../components/UserManager';
import { useExpenseData } from '../hooks/useExpenseData';

export function UsersPage() {
  const { users, categories, addUser, updateUser, deleteUser, importUsers, setUsers } = useExpenseData();

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
      {/* User Manager */}
      <UserManager
        users={users}
        categories={categories}
        onUpdateUsers={handleUpdateUsers}
      />
    </div>
  );
}