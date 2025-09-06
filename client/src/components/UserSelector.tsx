import { useState } from 'react';
import { User } from '@shared/schema';
import { ChevronDown, Users, AtSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  showAllUsers?: boolean;
}

export function UserSelector({
  users,
  selectedUser,
  onUserSelect,
  showAllUsers = true
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md min-w-[200px]"
      >
        {selectedUser ? (
          <>
            <div className={`w-8 h-8 rounded-full ${selectedUser.color} flex items-center justify-center text-white text-sm font-semibold`}>
              {selectedUser.avatar}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{selectedUser.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                {selectedUser.username}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{useCaseConfig.terminology.allUsers}</div>
              <div className="text-xs text-gray-500">Combined view</div>
            </div>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
            {showAllUsers && (
              <button
                onClick={() => {
                  onUserSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!selectedUser ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{useCaseConfig.terminology.allUsers}</div>
                  <div className="text-xs text-gray-500">Combined view</div>
                </div>
              </button>
            )}
            {users.filter(user => user.isActive).map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onUserSelect(user);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedUser?.id === user.id ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-semibold`}>
                  {user.avatar}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <AtSign className="w-3 h-3" />
                    {user.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}