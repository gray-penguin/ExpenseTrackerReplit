import React, { useState, useEffect } from 'react';
import { User, Category, Expense, ExpenseAttachment } from '../types';
import { formatLastUsed, formatFrequency } from '../utils/formatters';
import { X, Plus, Trash2, DollarSign, Calendar, FileText, Tag, Store, MapPin, Star, Copy, Save, ChevronDown, Upload, Eye, Paperclip, StickyNote, Users, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getUseCaseConfig } from '../utils/useCaseConfig';

interface StoreData {
  name: string;
  location?: string;
  frequency: number;
  lastUsed: string;
}

interface SuggestionData {
  value: string;
  frequency: number;
  lastUsed: string;
}

interface BulkExpenseFormProps {
  users: User[];
  categories: Category[];
  expenses?: Expense[]; 
  onSubmit: (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}

interface ExpenseItem {
  id: string;
  userId: string;
  categoryId: string;
  subcategoryId: string;
  amount: string;
  description: string;
  notes: string;
  attachments: ExpenseAttachment[];
  storeName: string;
  storeLocation: string;
  date: string;
}

interface GlobalDefaults {
  userId: string;
  categoryId: string;
  subcategoryId: string;
  storeName: string;
  storeLocation: string;
  date: string;
}

const createEmptyExpenseItem = (defaults?: Partial<GlobalDefaults>): ExpenseItem => ({
  id: Math.random().toString(36).substr(2, 9),
  userId: defaults?.userId || '',
  categoryId: defaults?.categoryId || '',
  subcategoryId: defaults?.subcategoryId || '',
  amount: '',
  description: '',
  notes: '',
  attachments: [],
  storeName: defaults?.storeName || '',
  storeLocation: defaults?.storeLocation || '',
  date: defaults?.date || ''
});

export const BulkExpenseForm: React.FC<BulkExpenseFormProps> = ({
  users,
  categories,
  expenses = [],
  onSubmit,
  onClose
}) => {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);
  
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    createEmptyExpenseItem(),
    createEmptyExpenseItem(),
    createEmptyExpenseItem()
  ]);
  
  const [globalDefaults, setGlobalDefaults] = useState<GlobalDefaults>({
    userId: users[0]?.id || '',
    categoryId: '',
    subcategoryId: '',
    storeName: '',
    storeLocation: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState<{ [key: string]: boolean }>({});
  const [descriptionSearchTerms, setDescriptionSearchTerms] = useState<{ [key: string]: string }>({});

  // Get store suggestions from previous expenses
  const getStoreSuggestions = (): StoreData[] => {
    const storeMap = new Map<string, StoreData>();

    expenses.forEach(exp => {
      if (exp.storeName) {
        const key = exp.storeName.toLowerCase();
        const existing = storeMap.get(key);
        
        if (existing) {
          existing.frequency += 1;
          if (new Date(exp.date) > new Date(existing.lastUsed)) {
            existing.lastUsed = exp.date;
            if (exp.storeLocation) {
              existing.location = exp.storeLocation;
            }
          }
        } else {
          storeMap.set(key, {
            name: exp.storeName,
            location: exp.storeLocation,
            frequency: 1,
            lastUsed: exp.date
          });
        }
      }
    });

    return Array.from(storeMap.values())
      .sort((a, b) => {
        // Sort by frequency first, then by recency
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });
  };

  const storeSuggestions = getStoreSuggestions();

  // Filter suggestions based on search term
  const filteredStoreSuggestions = storeSuggestions.filter(store =>
    store.name.toLowerCase().includes(storeSearchTerm.toLowerCase())
  ).slice(0, 10);

  // Get description suggestions from previous expenses
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

  // Get filtered description suggestions for a specific item
  const getFilteredDescriptionSuggestions = (itemId: string): SuggestionData[] => {
    const searchTerm = descriptionSearchTerms[itemId] || '';
    return descriptionSuggestions.filter(suggestion =>
      suggestion.value.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  };

  // Update search term when global defaults store name changes
  useEffect(() => {
    setStoreSearchTerm(globalDefaults.storeName);
  }, [globalDefaults.storeName]);

  const selectedGlobalCategory = categories.find(c => c.id === globalDefaults.categoryId);
  const availableGlobalSubcategories = selectedGlobalCategory?.subcategories || [];

  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, createEmptyExpenseItem(globalDefaults)]);
  };

  const removeExpenseItem = (id: string) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter(item => item.id !== id));
    }
  };

  const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(expenseItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const duplicateExpenseItem = (id: string) => {
    const itemToDuplicate = expenseItems.find(item => item.id === id);
    if (itemToDuplicate) {
      const duplicatedItem = {
        ...itemToDuplicate,
        id: Math.random().toString(36).substr(2, 9)
      };
      const index = expenseItems.findIndex(item => item.id === id);
      const newItems = [...expenseItems];
      newItems.splice(index + 1, 0, duplicatedItem);
      setExpenseItems(newItems);
    }
  };

  const applyGlobalDefaults = () => {
    setExpenseItems(expenseItems.map(item => ({
      ...item,
      userId: item.userId || globalDefaults.userId,
      categoryId: item.categoryId || globalDefaults.categoryId,
      subcategoryId: item.subcategoryId || globalDefaults.subcategoryId,
      storeName: item.storeName || globalDefaults.storeName,
      storeLocation: item.storeLocation || globalDefaults.storeLocation,
      date: item.date || globalDefaults.date || new Date().toISOString().split('T')[0]
    })));
  };

  const applyGlobalDefaultsToItem = (itemId: string) => {
    setExpenseItems(expenseItems.map(item => 
      item.id === itemId ? {
        ...item,
        userId: item.userId || globalDefaults.userId,
        categoryId: item.categoryId || globalDefaults.categoryId,
        subcategoryId: item.subcategoryId || globalDefaults.subcategoryId,
        storeName: item.storeName || globalDefaults.storeName,
        storeLocation: item.storeLocation || globalDefaults.storeLocation,
        date: item.date || globalDefaults.date || new Date().toISOString().split('T')[0]
      } : item
    ));
  };

  const handleFileUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert(`File "${file.name}" is not supported. Please upload images or PDF files only.`);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Please upload files smaller than 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAttachment: ExpenseAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString()
        };

        const currentItem = expenseItems.find(item => item.id === itemId);
        if (currentItem) {
          updateExpenseItem(itemId, 'attachments', [...currentItem.attachments, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const removeAttachment = (itemId: string, attachmentId: string) => {
    const currentItem = expenseItems.find(item => item.id === itemId);
    if (currentItem) {
      const updatedAttachments = currentItem.attachments.filter(att => att.id !== attachmentId);
      updateExpenseItem(itemId, 'attachments', updatedAttachments);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStoreSelect = (store: StoreData) => {
    setGlobalDefaults(prev => ({
      ...prev,
      storeName: store.name,
      storeLocation: store.location || prev.storeLocation
    }));
    setShowStoreSuggestions(false);
  };

  const handleDescriptionSelect = (itemId: string, description: string) => {
    setExpenseItems(expenseItems.map(item => 
      item.id === itemId ? { ...item, description } : item
    ));
    setShowDescriptionSuggestions(prev => ({ ...prev, [itemId]: false }));
  };

  const handleDescriptionChange = (itemId: string, value: string) => {
    setExpenseItems(expenseItems.map(item => 
      item.id === itemId ? { ...item, description: value } : item
    ));
    setDescriptionSearchTerms(prev => ({ ...prev, [itemId]: value }));
    setShowDescriptionSuggestions(prev => ({ ...prev, [itemId]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validExpenses = expenseItems
      .filter(item => item.amount && item.categoryId && item.userId && item.description && item.storeName && item.storeLocation)
      .map(item => ({
        userId: item.userId,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId || '',
        amount: parseFloat(item.amount),
        description: item.description,
        notes: item.notes || undefined,
        attachments: item.attachments.length > 0 ? item.attachments : undefined,
        storeName: item.storeName || undefined,
        storeLocation: item.storeLocation || undefined,
        date: item.date
      }));

    if (validExpenses.length === 0) {
      alert('Please fill in at least one valid expense with all required fields (amount, category, user, description, store name, and store location).');
      return;
    }

    onSubmit(validExpenses);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-7xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900">Add Multiple Expenses</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Global Defaults Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">Global Defaults</h3>
                <p className="text-emerald-700 text-sm">Set default values to apply to all expense entries</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* First row: User and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Default {useCaseConfig.userLabelSingular}</label>
                  <div className="relative">
                    <select
                      value={globalDefaults.userId}
                      onChange={(e) => setGlobalDefaults(prev => ({ ...prev, userId: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    >
                      <option value="">No default</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Default Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={globalDefaults.date}
                      onChange={(e) => setGlobalDefaults(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Second row: Category, Subcategory, Store Name, Store Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Default Category</label>
                  <div className="relative">
                    <select
                      value={globalDefaults.categoryId}
                      onChange={(e) => setGlobalDefaults(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: '' }))}
                      className="w-full px-4 py-3 pl-12 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    >
                      <option value="">No default</option>
                      {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Default Subcategory</label>
                  <select
                    value={globalDefaults.subcategoryId}
                    onChange={(e) => setGlobalDefaults(prev => ({ ...prev, subcategoryId: e.target.value }))}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    disabled={availableGlobalSubcategories.length === 0}
                  >
                    <option value="">
                      {availableGlobalSubcategories.length === 0 ? 'Select category first' : 'No default'}
                    </option>
                    {availableGlobalSubcategories.sort((a, b) => a.name.localeCompare(b.name)).map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))}
                  </select>
                </div>

                {/* Store Name with Suggestions */}
                <div className="relative">
                  <label className="block text-sm font-medium text-emerald-800 mb-2">
                    Default Store Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={globalDefaults.storeName}
                      onChange={(e) => {
                        setGlobalDefaults(prev => ({ ...prev, storeName: e.target.value }));
                        setStoreSearchTerm(e.target.value);
                        setShowStoreSuggestions(true);
                      }}
                      onFocus={() => setShowStoreSuggestions(true)}
                      className="w-full px-4 py-3 pl-12 pr-10 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Whole Foods"
                    />
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                    {storeSuggestions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowStoreSuggestions(!showStoreSuggestions)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-100 rounded transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 text-emerald-600 transition-transform ${showStoreSuggestions ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Store Suggestions Dropdown */}
                  {showStoreSuggestions && filteredStoreSuggestions.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStoreSuggestions(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-emerald-200 shadow-lg z-20 max-h-64 overflow-y-auto">
                        <div className="p-2 border-b border-emerald-100">
                          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Previously Used Stores</div>
                        </div>
                        {filteredStoreSuggestions.map((store, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleStoreSelect(store)}
                            className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b border-emerald-50 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-emerald-900 truncate">{store.name}</div>
                                {store.location && (
                                  <div className="text-xs text-emerald-600 truncate">{store.location}</div>
                                )}
                              </div>
                              <div className="text-xs text-emerald-500 ml-2 flex-shrink-0">
                                <div>{formatFrequency(store.frequency)}</div>
                                <div>Last: {formatLastUsed(store.lastUsed)}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                        {storeSearchTerm && filteredStoreSuggestions.length === 0 && (
                          <div className="px-3 py-2 text-sm text-emerald-600">
                            No stores match "{storeSearchTerm}"
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">Default Store Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={globalDefaults.storeLocation}
                      onChange={(e) => setGlobalDefaults(prev => ({ ...prev, storeLocation: e.target.value }))}
                      className="w-full px-4 py-3 pl-12 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Downtown"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={applyGlobalDefaults}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                <Zap className="w-4 h-4" />
                Apply Defaults to All Expenses
              </button>
            </div>
          </div>

          {/* Expense Items */}
          <div className="space-y-4">
            {expenseItems.map((item, index) => {
              const selectedCategory = categories.find(c => c.id === item.categoryId);
              const availableSubcategories = selectedCategory?.subcategories || [];
              const selectedUser = users.find(u => u.id === item.userId);

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">{index + 1}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">Expense #{index + 1}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyGlobalDefaultsToItem(item.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Apply global defaults to this expense"
                      >
                        <Zap className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateExpenseItem(item.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicate expense"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {expenseItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove expense"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main fields in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9 gap-1 mb-3">
                    {/* User */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{useCaseConfig.userLabelSingular} *</label>
                      <div className="relative">
                        <select
                          value={item.userId}
                          onChange={(e) => updateExpenseItem(item.id, 'userId', e.target.value)}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                          required
                        >
                          <option value="">Select {useCaseConfig.terminology.user}</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                        {selectedUser ? (
                          <div className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${selectedUser.color} flex items-center justify-center text-white text-xs font-medium`}>
                            {selectedUser.avatar}
                          </div>
                        ) : (
                          <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                      <div className="relative">
                        <select
                          value={item.categoryId}
                          onChange={(e) => {
                            updateExpenseItem(item.id, 'categoryId', e.target.value);
                            updateExpenseItem(item.id, 'subcategoryId', '');
                          }}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                        <Tag className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Subcategory</label>
                      <select
                        value={item.subcategoryId}
                        onChange={(e) => updateExpenseItem(item.id, 'subcategoryId', e.target.value)}
                        className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                        disabled={availableSubcategories.length === 0}
                      >
                        <option value="">
                          {availableSubcategories.length === 0 ? 'Select category first' : 'Select subcategory'}
                        </option>
                        {availableSubcategories.sort((a, b) => a.name.localeCompare(b.name)).map(subcategory => (
                          <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={item.date || new Date().toISOString().split('T')[0]}
                          onChange={(e) => updateExpenseItem(item.id, 'date', e.target.value)}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Store Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Store Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.storeName}
                          onChange={(e) => updateExpenseItem(item.id, 'storeName', e.target.value)}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="e.g., Whole Foods"
                          required
                        />
                        <Store className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Store Location */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Store Location *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.storeLocation}
                          onChange={(e) => updateExpenseItem(item.id, 'storeLocation', e.target.value)}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="e.g., Downtown"
                          required
                        />
                        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="xl:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Description *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                          onFocus={() => setShowDescriptionSuggestions(prev => ({ ...prev, [item.id]: true }))}
                          className="w-full px-2 py-2 pl-8 pr-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="What did you spend on?"
                          required
                        />
                        <FileText className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        {descriptionSuggestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowDescriptionSuggestions(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
                          >
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showDescriptionSuggestions[item.id] ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {/* Description Suggestions Dropdown */}
                        {showDescriptionSuggestions[item.id] && getFilteredDescriptionSuggestions(item.id).length > 0 && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowDescriptionSuggestions(prev => ({ ...prev, [item.id]: false }))} />
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                              <div className="p-2 border-b border-slate-100">
                                <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                  Previously Used Descriptions ({descriptionSuggestions.length})
                                </div>
                              </div>
                              {getFilteredDescriptionSuggestions(item.id).map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleDescriptionSelect(item.id, suggestion.value)}
                                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                                    <span className="text-xs text-slate-900 truncate">{suggestion.value}</span>
                                  </div>
                                </button>
                              ))}
                              {descriptionSearchTerms[item.id] && getFilteredDescriptionSuggestions(item.id).length === 0 && (
                                <div className="px-2 py-1.5 text-xs text-slate-500">
                                  No descriptions match "{descriptionSearchTerms[item.id]}"
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="xl:max-w-[80px]">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Amount *</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', e.target.value)}
                          className="w-full px-2 py-2 pl-8 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.00"
                          required
                        />
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Notes and Attachments Section */}
                  {(item.notes || item.attachments.length > 0) && (
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      {/* Notes */}
                      {item.notes && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                          <textarea
                            value={item.notes}
                            onChange={(e) => updateExpenseItem(item.id, 'notes', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                            rows={2}
                            placeholder="Add any additional notes about this expense..."
                          />
                        </div>
                      )}

                      {/* Attachments */}
                      {item.attachments.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-2">Attachments</label>
                          <div className="flex gap-2 overflow-x-auto">
                            {item.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex-shrink-0 relative group">
                                {attachment.type.startsWith('image/') ? (
                                  <div className="relative">
                                    <img
                                      src={attachment.dataUrl}
                                      alt={attachment.name}
                                      className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => setPreviewImage(attachment.dataUrl)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded">
                                      <Eye className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-red-600" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(item.id, attachment.id)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove attachment"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Notes/Attachments buttons */}
                  <div className="flex gap-2 mt-3">
                    {!item.notes && (
                      <button
                        type="button"
                        onClick={() => updateExpenseItem(item.id, 'notes', ' ')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      >
                        <StickyNote className="w-3 h-3" />
                        Add Notes
                      </button>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(item.id, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id={`file-upload-${item.id}`}
                      />
                      <label
                        htmlFor={`file-upload-${item.id}`}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-3 h-3" />
                        Add Files
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add More Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addExpenseItem}
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Another Expense
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
            >
              Add All Expenses
            </button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};