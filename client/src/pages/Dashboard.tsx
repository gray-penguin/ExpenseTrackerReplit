import { useState } from 'react';
import { User, Category, Expense } from '../types';
import { UserSelector } from '../components/UserSelector';
import { Dashboard as DashboardComponent } from '../components/Dashboard';
import { useExpenseData } from '../hooks/useExpenseData';
import { useLocation } from 'wouter';

export function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const { users, categories, expenses } = useExpenseData();

  const handleNavigateToExpenses = (categoryId: string, subcategoryId: string) => {
    setLocation(`/expenses?categoryId=${categoryId}&subcategoryId=${subcategoryId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header with User Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your expenses and spending patterns</p>
        </div>
        <UserSelector
          users={users}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>

      {/* Dashboard Component */}
      <DashboardComponent
        expenses={expenses}
        users={users}
        categories={categories}
        selectedUser={selectedUser}
        onNavigateToExpenses={handleNavigateToExpenses}
      />
    </div>
  );
}