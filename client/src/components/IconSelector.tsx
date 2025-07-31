import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  onClose: () => void;
}

// Comprehensive list of available icons organized by category
const iconCategories = {
  'Food & Dining': [
    'Utensils', 'Coffee', 'Wine', 'Pizza', 'Cake', 'Apple', 'Beef',
    'Fish', 'Salad', 'IceCreamCone', 'Cookie', 'ChefHat', 'UtensilsCrossed'
  ],
  'Transportation': [
    'Car', 'Bike', 'Bus', 'Train', 'Plane', 'Ship', 'Truck', 'Bike',
    'Fuel', 'ParkingCircle', 'Navigation', 'MapPin', 'Compass'
  ],
  'Entertainment': [
    'Music', 'Headphones', 'Radio', 'Tv', 'Monitor', 'Gamepad2', 'Joystick',
    'Camera', 'Video', 'Film', 'Mic', 'Speaker', 'Volume2'
  ],
  'Shopping': [
    'ShoppingBag', 'ShoppingCart', 'Store', 'Package', 'Gift', 'CreditCard',
    'Wallet', 'Receipt', 'Tag', 'ScanLine', 'Shirt', 'Watch'
  ],
  'Health & Fitness': [
    'Heart', 'Activity', 'Dumbbell', 'Bike', 'PersonStanding', 'Footprints', 'Zap',
    'Thermometer', 'Stethoscope', 'Pill', 'Cross', 'Shield'
  ],
  'Home & Utilities': [
    'Home', 'Lightbulb', 'Zap', 'Wifi', 'Phone', 'Smartphone', 'Laptop',
    'Tv', 'WashingMachine', 'Refrigerator', 'Sofa', 'Bed'
  ],
  'Work & Business': [
    'Briefcase', 'Building', 'Building2', 'Factory', 'Store', 'Calculator',
    'FileText', 'Folder', 'Mail', 'Phone', 'Users', 'UserCheck'
  ],
  'Education': [
    'GraduationCap', 'Book', 'BookOpen', 'Library', 'PenTool', 'Edit',
    'FileText', 'Calculator', 'Globe', 'Award', 'Trophy'
  ],
  'Travel': [
    'Plane', 'MapPin', 'Map', 'Compass', 'Navigation', 'Luggage', 'Camera',
    'Binoculars', 'Tent', 'Mountain', 'Palmtree', 'Sun'
  ],
  'Finance': [
    'DollarSign', 'CreditCard', 'Wallet', 'PiggyBank', 'TrendingUp', 'TrendingDown',
    'BarChart3', 'PieChart', 'Calculator', 'Receipt', 'Coins'
  ],
  'Technology': [
    'Smartphone', 'Laptop', 'Monitor', 'Tablet', 'Watch', 'Headphones',
    'Keyboard', 'Mouse', 'Printer', 'HardDrive', 'Wifi', 'Bluetooth'
  ],
  'Personal Care': [
    'Scissors', 'Brush', 'Sparkles', 'Droplets', 'Sun', 'Moon',
    'Eye', 'Smile', 'Heart', 'Star', 'Flower', 'Leaf'
  ],
  'Pets & Animals': [
    'PawPrint', 'Dog', 'Cat', 'Fish', 'Bird', 'Rabbit', 'Squirrel',
    'Bug', 'Turtle', 'Heart', 'Bone', 'Home'
  ],
  'Hobbies': [
    'Palette', 'Brush', 'Camera', 'Music', 'Guitar', 'Piano', 'Gamepad2',
    'Puzzle', 'Dice1', 'Target', 'Telescope', 'Microscope'
  ],
  'General': [
    'Tag', 'Star', 'Circle', 'Square', 'Triangle', 'Diamond', 'Heart',
    'Bookmark', 'Flag', 'Bell', 'Clock', 'Calendar', 'Hash', 'Plus'
  ]
};

// Flatten all icons for search
const allIcons = Object.values(iconCategories).flat();

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter icons based on search term and category
  const filteredIcons = React.useMemo(() => {
    let iconsToShow = selectedCategory === 'All' 
      ? allIcons 
      : iconCategories[selectedCategory as keyof typeof iconCategories] || [];

    if (searchTerm) {
      iconsToShow = iconsToShow.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return iconsToShow;
  }, [searchTerm, selectedCategory]);

  const handleIconClick = (iconName: string) => {
    onIconSelect(iconName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Category Icon</h2>
            <p className="text-slate-500 mt-1">Choose an icon that represents your category</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-slate-200 bg-slate-50">
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Icons ({allIcons.length})
                </button>
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {category} ({icons.length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {searchTerm && (
                <p className="text-sm text-slate-500 mt-2">
                  {filteredIcons.length} icons found for "{searchTerm}"
                </p>
              )}
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No icons found</h3>
                  <p className="text-slate-500">
                    {searchTerm 
                      ? `No icons match "${searchTerm}". Try a different search term.`
                      : 'No icons available in this category.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 xl:grid-cols-16 gap-2">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                    const isSelected = selectedIcon === iconName;
                    
                    // Skip rendering if the icon component doesn't exist
                    if (!IconComponent) {
                      console.warn(`Icon "${iconName}" not found in lucide-react`);
                      return null;
                    }
                    
                    return (
                      <button
                        key={iconName}
                        onClick={() => handleIconClick(iconName)}
                        className={`group relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        title={iconName}
                      >
                        <IconComponent className={`w-5 h-5 mx-auto ${
                          isSelected ? 'text-emerald-600' : 'text-slate-600 group-hover:text-slate-800'
                        }`} />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {iconName}
                        </div>
                        
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {selectedIcon && (
                    <div className="flex items-center gap-2">
                      <span>Selected:</span>
                      <div className="flex items-center gap-2 px-2 py-1 bg-white rounded border">
                        {(() => {
                          const IconComponent = Icons[selectedIcon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                          return IconComponent ? <IconComponent className="w-4 h-4 text-slate-600" /> : <Tag className="w-4 h-4 text-slate-600" />;
                        })()}
                        <span className="font-medium">{selectedIcon}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedIcon && handleIconClick(selectedIcon)}
                    disabled={!selectedIcon}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Select Icon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};