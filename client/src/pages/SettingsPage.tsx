import { useState } from "react";
import { Settings } from "../components/Settings";
import { BackupAndRestoreTab } from "../components/BackupAndRestoreTab";
import { useExpenseData } from "../hooks/useExpenseData";
import { useAuth } from "../hooks/useAuth";

export function SettingsPage() {
  const { expenses, categories, clearAllExpenses, setCategories, setExpenses } = useExpenseData();
  const { credentials, updateCredentials, logout } = useAuth();

  const handleClearAllCategories = () => {
    // Clear both categories and expenses since expenses depend on categories
    setCategories([]);
    setExpenses([]);
  };

  const handleUpdateUseCase = (useCase: string) => {
    updateCredentials({ useCase });
  };

  const handleDataRestored = () => {
    // Reload the page to reflect restored data
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Configure your expense tracker preferences
          </p>
        </div>
      </div>

      {/* Settings Component */}
      <Settings
        onClearAllExpenses={clearAllExpenses}
        expenseCount={expenses.length}
        onClearAllCategories={handleClearAllCategories}
        categories={categories}
        onLogout={logout}
        onUpdateCredentials={updateCredentials}
        currentCredentials={credentials}
        onUpdateUseCase={handleUpdateUseCase}
        currentUseCase={credentials.useCase}
      />
    </div>
  );
}