import { User, Category, Expense } from '../types';

// Jones family members
export const users: User[] = [
  {
    id: '1',
    name: 'David Jones',
    username: 'davidj',
    email: 'david.jones@family.com',
    avatar: 'DJ',
    color: 'bg-emerald-500',
    defaultCategoryId: '1',
    defaultSubcategoryId: '1',
    defaultStoreLocation: 'Neighborhood'
  },
  {
    id: '2',
    name: 'Lisa Jones',
    username: 'lisaj',
    email: 'lisa.jones@family.com',
    avatar: 'LJ',
    color: 'bg-blue-500',
    defaultCategoryId: '2',
    defaultSubcategoryId: '6',
    defaultStoreLocation: 'Local Stores'
  },
  {
    id: '3',
    name: 'Emma Jones',
    username: 'emmaj',
    email: 'emma.jones@family.com',
    avatar: 'EJ',
    color: 'bg-purple-500',
    defaultCategoryId: '3',
    defaultSubcategoryId: '11',
    defaultStoreLocation: 'School Area'
  },
  {
    id: '4',
    name: 'Michael Jones',
    username: 'mikej',
    email: 'michael.jones@family.com',
    avatar: 'MJ',
    color: 'bg-orange-500',
    defaultCategoryId: '3',
    defaultSubcategoryId: '12',
    defaultStoreLocation: 'Local'
  }
];

// Family expense categories with relevant subcategories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Utilities',
    icon: 'Zap',
    color: 'text-yellow-600',
    subcategories: [
      { id: '1', name: 'Electricity', categoryId: '1' },
      { id: '2', name: 'Water & Sewer', categoryId: '1' },
      { id: '3', name: 'Natural Gas', categoryId: '1' },
      { id: '4', name: 'Internet & Cable', categoryId: '1' },
      { id: '5', name: 'Phone & Mobile', categoryId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: 'text-green-600',
    subcategories: [
      { id: '6', name: 'Weekly Shopping', categoryId: '2' },
      { id: '7', name: 'Fresh Produce', categoryId: '2' },
      { id: '8', name: 'Meat & Dairy', categoryId: '2' },
      { id: '9', name: 'Household Items', categoryId: '2' },
      { id: '10', name: 'Snacks & Treats', categoryId: '2' }
    ]
  },
  {
    id: '3',
    name: 'Transportation',
    icon: 'Car',
    color: 'text-blue-600',
    subcategories: [
      { id: '11', name: 'Gasoline', categoryId: '3' },
      { id: '12', name: 'Car Maintenance', categoryId: '3' },
      { id: '13', name: 'Car Insurance', categoryId: '3' },
      { id: '14', name: 'Public Transit', categoryId: '3' },
      { id: '15', name: 'Parking & Tolls', categoryId: '3' }
    ]
  },
  {
    id: '4',
    name: 'Vacation',
    icon: 'Plane',
    color: 'text-purple-600',
    subcategories: [
      { id: '16', name: 'Flights & Travel', categoryId: '4' },
      { id: '17', name: 'Hotels & Lodging', categoryId: '4' },
      { id: '18', name: 'Dining Out', categoryId: '4' },
      { id: '19', name: 'Activities & Tours', categoryId: '4' },
      { id: '20', name: 'Souvenirs & Gifts', categoryId: '4' }
    ]
  },
  {
    id: '5',
    name: 'Home Improvements',
    icon: 'Home',
    color: 'text-orange-600',
    subcategories: [
      { id: '21', name: 'Tools & Hardware', categoryId: '5' },
      { id: '22', name: 'Paint & Supplies', categoryId: '5' },
      { id: '23', name: 'Appliances', categoryId: '5' },
      { id: '24', name: 'Furniture', categoryId: '5' },
      { id: '25', name: 'Professional Services', categoryId: '5' }
    ]
  }
];

// Sample Jones family expenses (this is just a preview - the app generates 500 automatically)
export const expenses: Expense[] = [
  // Utilities - David Jones
  {
    id: '1',
    userId: '1',
    categoryId: '1',
    subcategoryId: '1',
    amount: 125.45,
    description: 'Monthly electricity bill',
    notes: 'Higher usage due to winter heating',
    storeName: 'Pacific Power',
    storeLocation: 'Online',
    date: '2025-01-15',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: '2',
    categoryId: '2',
    subcategoryId: '6',
    amount: 145.67,
    description: 'Weekly grocery shopping',
    notes: 'Family groceries for the week',
    storeName: 'Safeway',
    storeLocation: 'Neighborhood',
    date: '2025-01-14',
    createdAt: '2025-01-14T18:45:00Z'
  },
  {
    id: '3',
    userId: '1',
    categoryId: '3',
    subcategoryId: '11',
    amount: 48.75,
    description: 'Gas fill-up',
    storeName: 'Shell',
    storeLocation: 'Main Street',
    date: '2025-01-13',
    createdAt: '2025-01-13T16:20:00Z'
  },
  {
    id: '4',
    userId: '3',
    categoryId: '4',
    subcategoryId: '19',
    amount: 125.00,
    description: 'Theme park tickets',
    notes: 'Family day out',
    storeName: 'Disneyland',
    storeLocation: 'Theme Park',
    date: '2025-01-12',
    createdAt: '2025-01-12T14:15:00Z'
  },
  {
    id: '5',
    userId: '2',
    categoryId: '5',
    subcategoryId: '23',
    amount: 1250.00,
    description: 'New refrigerator',
    notes: 'Old one broke down',
    storeName: 'Best Buy',
    storeLocation: 'Electronics Store',
    date: '2025-01-11',
    createdAt: '2025-01-11T14:30:00Z'
  }
];