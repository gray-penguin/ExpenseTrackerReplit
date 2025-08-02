import { useState } from "react";
import { Settings } from "../components/Settings";
import { BackupAndRestoreTab } from "../components/BackupAndRestoreTab";
import { useExpenseData } from "../hooks/useExpenseData";
import { useAuth } from "../hooks/useAuth";

export function SettingsPage() {
  const { expenses, clearAllExpenses } = useExpenseData();
  const { credentials, updateCredentials, logout } = useAuth();

  const handleUpdateUseCase = (useCase: string) => {
    updateCredentials({ useCase });
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
        onLogout={logout}
        onUpdateCredentials={updateCredentials}
        currentCredentials={credentials}
        onUpdateUseCase={handleUpdateUseCase}
        currentUseCase={credentials.useCase}
      />
    </div>
  );
}
