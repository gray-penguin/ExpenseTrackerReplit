import { useState } from 'react';
import { User } from '../types';
import { Plus } from 'lucide-react';
import { UserManager } from '../components/UserManager';
import { useExpenseData } from '../hooks/useExpenseData';

import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

export function UsersPage() {
  const { users, categories, addUser, updateUser, deleteUser, importUsers, setUsers } = useExpenseData();
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

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
        useCaseConfig={useCaseConfig}
      />
    </div>
  );
}