import React from 'react';
import { User, Category } from '../../types';
import { Search, Filter, Tag, Users, Calendar, CalendarDays, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUseCaseConfig } from '../../utils/useCaseConfig';

export type DateRangePreset = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (subcategoryId: string) => void;
  filterUserId: string;
  onUserFilterChange: (userId: string) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
  dateRangePreset: DateRangePreset;
  onDateRangePresetChange: (preset: DateRangePreset) => void;
  customDateRange: DateRange;
  onCustomDateRangeChange: (range: DateRange) => void;
  users: User[];
  categories: Category[];
  uniqueLocations: string[];
  showLocationSuggestions: boolean;
  onShowLocationSuggestions: (show: boolean) => void;
  onLocationSelect: (location: string) => void;
  onClearAllFilters: () => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  filterUserId,
  onUserFilterChange,
  locationFilter,
  onLocationFilterChange,
  dateRangePreset,
  onDateRangePresetChange,
  customDateRange,
  onCustomDateRangeChange,
  users,
  categories,
  uniqueLocations,
  showLocationSuggestions,
  onShowLocationSuggestions,
  onLocationSelect,
  onClearAllFilters
}) => {
  const { credentials } = useAuth();
  const useCaseConfig = getUseCaseConfig(credentials.useCase);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  const filteredLocations = uniqueLocations.filter(location =>
    location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || filterUserId || locationFilter || dateRangePreset !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses, stores..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={filterUserId}
            onChange={(e) => onUserFilterChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            <option value="">All {useCaseConfig.terminology.users}</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            <option value="">All categories</option>
            {categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={selectedSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            disabled={!selectedCategory}
          >
            <option value="">
              {selectedCategory ? 'All subcategories' : 'Select category first'}
            </option>
            {availableSubcategories.sort((a, b) => a.name.localeCompare(b.name)).map(subcategory => (
              <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => onLocationFilterChange(e.target.value)}
              onFocus={() => onShowLocationSuggestions(true)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {uniqueLocations.length > 0 && (
              <button
                type="button"
                onClick={() => onShowLocationSuggestions(!showLocationSuggestions)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLocationSuggestions ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Location Suggestions Dropdown */}
          {showLocationSuggestions && uniqueLocations.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => onShowLocationSuggestions(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                <div className="p-2 border-b border-slate-100">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Available Locations ({uniqueLocations.length})
                  </div>
                </div>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onLocationSelect(location)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-900 truncate">{location}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    No locations match "{locationFilter}"
                  </div>
                )}
                {locationFilter && (
                  <div className="p-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onLocationFilterChange('')}
                      className="w-full text-left px-2 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={dateRangePreset}
            onChange={(e) => onDateRangePresetChange(e.target.value as DateRangePreset)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This week</option>
            <option value="lastWeek">Last week</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="thisYear">This year</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {dateRangePreset === 'custom' && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => onCustomDateRangeChange({ ...customDateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 pl-10 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => onCustomDateRangeChange({ ...customDateRange, endDate: e.target.value })}
                  min={customDateRange.startDate}
                  className="w-full px-3 py-2 pl-10 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-700">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                Search: "{searchTerm}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}

            {filterUserId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                <div className={`w-4 h-4 rounded-full ${users.find(u => u.id === filterUserId)?.color} flex items-center justify-center text-white text-xs font-medium mr-1`}>
                  {users.find(u => u.id === filterUserId)?.avatar}
                </div>
                User: {users.find(u => u.id === filterUserId)?.name}
                <button
                  onClick={() => onUserFilterChange('')}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => onCategoryChange('')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Subcategory: {availableSubcategories.find(s => s.id === selectedSubcategory)?.name}
                <button
                  onClick={() => onSubcategoryChange('')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}

            {locationFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                <MapPin className="w-3 h-3" />
                Location: "{locationFilter}"
                <button
                  onClick={() => onLocationFilterChange('')}
                  className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}

            {dateRangePreset !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                <Calendar className="w-3 h-3" />
                {dateRangePreset === 'custom' ? 'Custom range' : 
                 dateRangePreset.charAt(0).toUpperCase() + dateRangePreset.slice(1).replace(/([A-Z])/g, ' $1')}
                <button
                  onClick={() => onDateRangePresetChange('all')}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            
            <button
              onClick={onClearAllFilters}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};