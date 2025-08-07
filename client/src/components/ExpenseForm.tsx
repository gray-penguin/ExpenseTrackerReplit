import { useState } from 'react';
import { User, Category, Subcategory, Expense } from '../types';
import { X, DollarSign, Calendar, FileText, Tag, Store, MapPin, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

interface ExpenseFormProps {
  users: User[];
  categories: Category[];
  expense?: Expense;
  expenses?: Expense[];
  onSubmit: (expense: any) => void;
  onClose: () => void;
  onDelete?: (expenseId: string) => void;
}

export function ExpenseForm({
  users,
  categories,
  expense,
  expenses = [],
  onSubmit,
  onClose,
  onDelete
}: ExpenseFormProps) {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);
  
  const [formData, setFormData] = useState({
    userId: expense?.userId || users[0]?.id?.toString() || '',
    categoryId: expense?.categoryId || '',
    subcategoryId: expense?.subcategoryId || '',
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    notes: expense?.notes || '',
    storeName: expense?.storeName || '',
    storeLocation: expense?.storeLocation || '',
    date: expense?.date || new Date().toISOString().split('T')[0]
  });

  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState('');
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');

  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
  const selectedUser = users.find(u => u.id.toString() === formData.userId);

  // Get subcategories from the selected category
  const availableSubcategories = selectedCategory?.subcategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.categoryId || !formData.subcategoryId || !formData.amount || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset subcategory when category changes
      ...(field === 'categoryId' ? { subcategoryId: '' } : {})
    }));
  };

  // Get description suggestions from previous expenses
  interface SuggestionData {
    value: string;
    frequency: number;
    lastUsed: string;
  }

  const getDescriptionSuggestions = (): SuggestionData[] => {
    const descriptionMap = new Map<string, SuggestionData>();

    expenses.forEach(exp => {
      if (exp.description) {
        const key = exp.description.toLowerCase();
        const existing = descriptionMap.get(key);
        
        if (existing) {
          existing.frequency += 1;
          if (new Date(exp.date) > new Date(existing.lastUsed)) {
            existing.lastUsed = exp.date;
          }
        } else {
          descriptionMap.set(key, {
            value: exp.description,
            frequency: 1,
            lastUsed: exp.date
          });
        }
      }
    });

    return Array.from(descriptionMap.values())
      .sort((a, b) => {
        // Sort by frequency first, then by recency
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });
  };

  const descriptionSuggestions = getDescriptionSuggestions();

  // Get filtered description suggestions
  const getFilteredDescriptionSuggestions = (): SuggestionData[] => {
    return descriptionSuggestions.filter(suggestion =>
      suggestion.value.toLowerCase().includes(descriptionSearchTerm.toLowerCase())
    ).slice(0, 10);
  };

  // Handle description selection from dropdown
  const handleDescriptionSelect = (description: string) => {
    setFormData(prev => ({ ...prev, description }));
    setShowDescriptionSuggestions(false);
    setDescriptionSearchTerm('');
  };

  // Handle description change
  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    setDescriptionSearchTerm(value);
  };

  // Get store suggestions from previous expenses
  const getStoreSuggestions = (): SuggestionData[] => {
    const storeMap = new Map<string, SuggestionData>();

    expenses.forEach(exp => {
      if (exp.storeName) {
        const key = exp.storeName.toLowerCase();
        const existing = storeMap.get(key);
        
        if (existing) {
          existing.frequency += 1;
          if (new Date(exp.date) > new Date(existing.lastUsed)) {
            existing.lastUsed = exp.date;
          }
        } else {
          storeMap.set(key, {
            value: exp.storeName,
            frequency: 1,
            lastUsed: exp.date
          });
        }
      }
    });

    return Array.from(storeMap.values())
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });
  };

  const storeSuggestions = getStoreSuggestions();

  const getFilteredStoreSuggestions = (): SuggestionData[] => {
    return storeSuggestions.filter(suggestion =>
      suggestion.value.toLowerCase().includes(storeSearchTerm.toLowerCase())
    ).slice(0, 10);
  };

  const handleStoreSelect = (storeName: string) => {
    setFormData(prev => ({ ...prev, storeName }));
    setShowStoreSuggestions(false);
    setStoreSearchTerm('');
  };

  const handleStoreChange = (value: string) => {
    setFormData(prev => ({ ...prev, storeName: value }));
    setStoreSearchTerm(value);
  };

  // Get location suggestions from previous expenses
  const getLocationSuggestions = (): SuggestionData[] => {
    const locationMap = new Map<string, SuggestionData>();

    expenses.forEach(exp => {
      if (exp.storeLocation) {
        const key = exp.storeLocation.toLowerCase();
        const existing = locationMap.get(key);
        
        if (existing) {
          existing.frequency += 1;
          if (new Date(exp.date) > new Date(existing.lastUsed)) {
            existing.lastUsed = exp.date;
          }
        } else {
          locationMap.set(key, {
            value: exp.storeLocation,
            frequency: 1,
            lastUsed: exp.date
          });
        }
      }
    });

    return Array.from(locationMap.values())
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });
  };

  const locationSuggestions = getLocationSuggestions();

  const getFilteredLocationSuggestions = (): SuggestionData[] => {
    return locationSuggestions.filter(suggestion =>
      suggestion.value.toLowerCase().includes(locationSearchTerm.toLowerCase())
    ).slice(0, 10);
  };

  const handleLocationSelect = (storeLocation: string) => {
    setFormData(prev => ({ ...prev, storeLocation }));
    setShowLocationSuggestions(false);
    setLocationSearchTerm('');
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, storeLocation: value }));
    setLocationSearchTerm(value);
  };

  // Auto-fill functionality
  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id.toString() === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId,
        categoryId: user.defaultCategoryId || prev.categoryId,
        subcategoryId: user.defaultSubcategoryId || prev.subcategoryId,
        storeLocation: user.defaultStoreLocation || prev.storeLocation
      }));
    } else {
      handleChange('userId', userId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {useCaseConfig.userLabelSingular} <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-user"
              name="userId"
              value={formData.userId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a {useCaseConfig.terminology.user}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-category"
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-subcategory"
              name="subcategoryId"
              value={formData.subcategoryId}
              onChange={(e) => handleChange('subcategoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              disabled={!formData.categoryId}
            >
              <option value="">Select a subcategory</option>
              {availableSubcategories.sort((a: Subcategory, b: Subcategory) => a.name.localeCompare(b.name)).map((subcategory: Subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="expense-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                id="expense-description"
                name="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onFocus={() => setShowDescriptionSuggestions(true)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="What did you spend money on?"
                autocomplete="off"
                required
              />
              {/* Always show dropdown button for testing */}
              <button
                type="button"
                onClick={() => setShowDescriptionSuggestions(!showDescriptionSuggestions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title={`${descriptionSuggestions.length} descriptions available`}
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDescriptionSuggestions ? 'rotate-180' : ''}`} />
              </button>

              {/* Description Suggestions Dropdown */}
              {showDescriptionSuggestions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDescriptionSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Previously Used Descriptions ({descriptionSuggestions.length})
                      </div>
                    </div>
                    {getFilteredDescriptionSuggestions().length > 0 ? (
                      getFilteredDescriptionSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDescriptionSelect(suggestion.value)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{suggestion.value}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Used {suggestion.frequency} time{suggestion.frequency > 1 ? 's' : ''} • Last: {new Date(suggestion.lastUsed).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {descriptionSuggestions.length === 0 
                          ? "No previous descriptions found. Add some expenses to see suggestions here!"
                          : "No matching descriptions found"
                        }
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="expense-store-name"
                name="storeName"
                type="text"
                value={formData.storeName}
                onChange={(e) => handleStoreChange(e.target.value)}
                onFocus={() => setShowStoreSuggestions(true)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Where did you make this purchase?"
                autocomplete="off"
              />
              <button
                type="button"
                onClick={() => setShowStoreSuggestions(!showStoreSuggestions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title={`${storeSuggestions.length} stores available`}
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStoreSuggestions ? 'rotate-180' : ''}`} />
              </button>

              {/* Store Suggestions Dropdown */}
              {showStoreSuggestions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStoreSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Previously Used Stores ({storeSuggestions.length})
                      </div>
                    </div>
                    {getFilteredStoreSuggestions().length > 0 ? (
                      getFilteredStoreSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleStoreSelect(suggestion.value)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{suggestion.value}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Used {suggestion.frequency} time{suggestion.frequency > 1 ? 's' : ''} • Last: {new Date(suggestion.lastUsed).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {storeSuggestions.length === 0 
                          ? "No previous stores found. Add some expenses to see suggestions here!"
                          : "No matching stores found"
                        }
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Store Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="expense-store-location"
                name="storeLocation"
                type="text"
                value={formData.storeLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Store location or area"
                autocomplete="off"
              />
              <button
                type="button"
                onClick={() => setShowLocationSuggestions(!showLocationSuggestions)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title={`${locationSuggestions.length} locations available`}
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLocationSuggestions ? 'rotate-180' : ''}`} />
              </button>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLocationSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Previously Used Locations ({locationSuggestions.length})
                      </div>
                    </div>
                    {getFilteredLocationSuggestions().length > 0 ? (
                      getFilteredLocationSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleLocationSelect(suggestion.value)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{suggestion.value}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Used {suggestion.frequency} time{suggestion.frequency > 1 ? 's' : ''} • Last: {new Date(suggestion.lastUsed).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {locationSuggestions.length === 0 
                          ? "No previous locations found. Add some expenses to see suggestions here!"
                          : "No matching locations found"
                        }
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Any additional notes about this expense..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {expense && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(expense.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              {expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}