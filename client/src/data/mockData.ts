import { User, Category, Expense } from '../types';

// Two users with different profiles
export const users: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: 'alexc',
    email: 'alex.chen@example.com',
    avatar: 'AC',
    color: 'bg-emerald-500',
    defaultCategoryId: '1',
    defaultSubcategoryId: '1',
    defaultStoreLocation: 'Downtown'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    username: 'sarahj',
    email: 'sarah.johnson@example.com',
    avatar: 'SJ',
    color: 'bg-blue-500',
    defaultCategoryId: '2',
    defaultSubcategoryId: '4',
    defaultStoreLocation: 'Uptown'
  }
];

// Four main categories with relevant subcategories
export const categories: Category[] = [
  {
    id: '1',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: 'text-green-600',
    subcategories: [
      { id: '1', name: 'Fresh Produce', categoryId: '1' },
      { id: '2', name: 'Meat & Dairy', categoryId: '1' },
      { id: '3', name: 'Pantry Items', categoryId: '1' },
      { id: '4', name: 'Snacks & Beverages', categoryId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Utilities',
    icon: 'Zap',
    color: 'text-yellow-600',
    subcategories: [
      { id: '5', name: 'Electricity', categoryId: '2' },
      { id: '6', name: 'Water & Sewer', categoryId: '2' },
      { id: '7', name: 'Internet & Cable', categoryId: '2' },
      { id: '8', name: 'Gas', categoryId: '2' }
    ]
  },
  {
    id: '3',
    name: 'Entertainment',
    icon: 'Music',
    color: 'text-purple-600',
    subcategories: [
      { id: '9', name: 'Movies & Shows', categoryId: '3' },
      { id: '10', name: 'Gaming', categoryId: '3' },
      { id: '11', name: 'Concerts & Events', categoryId: '3' },
      { id: '12', name: 'Subscriptions', categoryId: '3' }
    ]
  },
  {
    id: '4',
    name: 'Automobile',
    icon: 'Car',
    color: 'text-blue-600',
    subcategories: [
      { id: '13', name: 'Fuel', categoryId: '4' },
      { id: '14', name: 'Maintenance', categoryId: '4' },
      { id: '15', name: 'Insurance', categoryId: '4' },
      { id: '16', name: 'Parking & Tolls', categoryId: '4' }
    ]
  }
];

// 40 diverse expenses across the categories and users
export const expenses: Expense[] = [
  // Groceries - Alex Chen
  {
    id: '1',
    userId: '1',
    categoryId: '1',
    subcategoryId: '1',
    amount: 45.67,
    description: 'Weekly fresh vegetables and fruits',
    notes: 'Organic produce from farmers market',
    storeName: 'Whole Foods Market',
    storeLocation: 'Downtown',
    date: '2025-01-15',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    categoryId: '1',
    subcategoryId: '2',
    amount: 32.89,
    description: 'Chicken breast and milk',
    storeName: 'Safeway',
    storeLocation: 'Downtown',
    date: '2025-01-14',
    createdAt: '2025-01-14T18:45:00Z'
  },
  {
    id: '3',
    userId: '1',
    categoryId: '1',
    subcategoryId: '3',
    amount: 28.50,
    description: 'Rice, pasta, and canned goods',
    storeName: 'Costco',
    storeLocation: 'Warehouse District',
    date: '2025-01-13',
    createdAt: '2025-01-13T16:20:00Z'
  },
  {
    id: '4',
    userId: '1',
    categoryId: '1',
    subcategoryId: '4',
    amount: 15.75,
    description: 'Coffee and energy drinks',
    storeName: 'Target',
    storeLocation: 'Downtown',
    date: '2025-01-12',
    createdAt: '2025-01-12T14:15:00Z'
  },
  
  // Groceries - Sarah Johnson
  {
    id: '5',
    userId: '2',
    categoryId: '1',
    subcategoryId: '1',
    amount: 52.30,
    description: 'Organic vegetables and berries',
    notes: 'Special diet requirements',
    storeName: 'Fresh Market',
    storeLocation: 'Uptown',
    date: '2025-01-15',
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    id: '6',
    userId: '2',
    categoryId: '1',
    subcategoryId: '2',
    amount: 41.20,
    description: 'Salmon and Greek yogurt',
    storeName: 'Whole Foods Market',
    storeLocation: 'Uptown',
    date: '2025-01-14',
    createdAt: '2025-01-14T17:30:00Z'
  },
  {
    id: '7',
    userId: '2',
    categoryId: '1',
    subcategoryId: '3',
    amount: 35.60,
    description: 'Quinoa, nuts, and olive oil',
    storeName: 'Trader Joes',
    storeLocation: 'Uptown',
    date: '2025-01-13',
    createdAt: '2025-01-13T15:45:00Z'
  },
  {
    id: '8',
    userId: '2',
    categoryId: '1',
    subcategoryId: '4',
    amount: 22.40,
    description: 'Herbal tea and dark chocolate',
    storeName: 'Natural Grocers',
    storeLocation: 'Uptown',
    date: '2025-01-12',
    createdAt: '2025-01-12T13:20:00Z'
  },

  // Utilities - Alex Chen
  {
    id: '9',
    userId: '1',
    categoryId: '2',
    subcategoryId: '5',
    amount: 125.45,
    description: 'Monthly electricity bill',
    notes: 'Higher usage due to cold weather',
    storeName: 'Seattle City Light',
    storeLocation: 'Online',
    date: '2025-01-10',
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: '10',
    userId: '1',
    categoryId: '2',
    subcategoryId: '6',
    amount: 78.90,
    description: 'Water and sewer services',
    storeName: 'Seattle Public Utilities',
    storeLocation: 'Online',
    date: '2025-01-08',
    createdAt: '2025-01-08T12:00:00Z'
  },
  {
    id: '11',
    userId: '1',
    categoryId: '2',
    subcategoryId: '7',
    amount: 89.99,
    description: 'High-speed internet and cable',
    storeName: 'Xfinity',
    storeLocation: 'Online',
    date: '2025-01-05',
    createdAt: '2025-01-05T10:30:00Z'
  },
  {
    id: '12',
    userId: '1',
    categoryId: '2',
    subcategoryId: '8',
    amount: 95.20,
    description: 'Natural gas heating',
    storeName: 'Puget Sound Energy',
    storeLocation: 'Online',
    date: '2025-01-03',
    createdAt: '2025-01-03T14:15:00Z'
  },

  // Utilities - Sarah Johnson
  {
    id: '13',
    userId: '2',
    categoryId: '2',
    subcategoryId: '5',
    amount: 110.30,
    description: 'Monthly electricity bill',
    storeName: 'Seattle City Light',
    storeLocation: 'Online',
    date: '2025-01-10',
    createdAt: '2025-01-10T08:30:00Z'
  },
  {
    id: '14',
    userId: '2',
    categoryId: '2',
    subcategoryId: '6',
    amount: 65.75,
    description: 'Water and sewer services',
    storeName: 'Seattle Public Utilities',
    storeLocation: 'Online',
    date: '2025-01-08',
    createdAt: '2025-01-08T12:30:00Z'
  },
  {
    id: '15',
    userId: '2',
    categoryId: '2',
    subcategoryId: '7',
    amount: 120.00,
    description: 'Fiber internet and premium cable',
    notes: 'Upgraded to faster plan',
    storeName: 'CenturyLink',
    storeLocation: 'Online',
    date: '2025-01-05',
    createdAt: '2025-01-05T11:00:00Z'
  },
  {
    id: '16',
    userId: '2',
    categoryId: '2',
    subcategoryId: '8',
    amount: 85.60,
    description: 'Natural gas heating',
    storeName: 'Puget Sound Energy',
    storeLocation: 'Online',
    date: '2025-01-03',
    createdAt: '2025-01-03T14:45:00Z'
  },

  // Entertainment - Alex Chen
  {
    id: '17',
    userId: '1',
    categoryId: '3',
    subcategoryId: '9',
    amount: 25.50,
    description: 'Movie tickets for two',
    storeName: 'AMC Theater',
    storeLocation: 'Downtown',
    date: '2025-01-14',
    createdAt: '2025-01-14T20:00:00Z'
  },
  {
    id: '18',
    userId: '1',
    categoryId: '3',
    subcategoryId: '10',
    amount: 59.99,
    description: 'New video game',
    notes: 'Latest release on Steam',
    storeName: 'Steam',
    storeLocation: 'Online',
    date: '2025-01-12',
    createdAt: '2025-01-12T19:30:00Z'
  },
  {
    id: '19',
    userId: '1',
    categoryId: '3',
    subcategoryId: '11',
    amount: 85.00,
    description: 'Concert tickets',
    storeName: 'Ticketmaster',
    storeLocation: 'Online',
    date: '2025-01-10',
    createdAt: '2025-01-10T16:45:00Z'
  },
  {
    id: '20',
    userId: '1',
    categoryId: '3',
    subcategoryId: '12',
    amount: 15.99,
    description: 'Netflix monthly subscription',
    storeName: 'Netflix',
    storeLocation: 'Online',
    date: '2025-01-01',
    createdAt: '2025-01-01T00:05:00Z'
  },

  // Entertainment - Sarah Johnson
  {
    id: '21',
    userId: '2',
    categoryId: '3',
    subcategoryId: '9',
    amount: 18.75,
    description: 'Streaming movie rental',
    storeName: 'Amazon Prime Video',
    storeLocation: 'Online',
    date: '2025-01-13',
    createdAt: '2025-01-13T21:15:00Z'
  },
  {
    id: '22',
    userId: '2',
    categoryId: '3',
    subcategoryId: '10',
    amount: 45.00,
    description: 'Board game for game night',
    storeName: 'Barnes & Noble',
    storeLocation: 'Uptown',
    date: '2025-01-11',
    createdAt: '2025-01-11T15:20:00Z'
  },
  {
    id: '23',
    userId: '2',
    categoryId: '3',
    subcategoryId: '11',
    amount: 120.00,
    description: 'Theater show tickets',
    notes: 'Anniversary celebration',
    storeName: 'Seattle Theatre Group',
    storeLocation: 'Downtown Seattle',
    date: '2025-01-09',
    createdAt: '2025-01-09T18:00:00Z'
  },
  {
    id: '24',
    userId: '2',
    categoryId: '3',
    subcategoryId: '12',
    amount: 12.99,
    description: 'Spotify Premium subscription',
    storeName: 'Spotify',
    storeLocation: 'Online',
    date: '2025-01-01',
    createdAt: '2025-01-01T00:10:00Z'
  },

  // Automobile - Alex Chen
  {
    id: '25',
    userId: '1',
    categoryId: '4',
    subcategoryId: '13',
    amount: 48.75,
    description: 'Gas fill-up',
    storeName: 'Shell',
    storeLocation: 'Downtown',
    date: '2025-01-15',
    createdAt: '2025-01-15T07:30:00Z'
  },
  {
    id: '26',
    userId: '1',
    categoryId: '4',
    subcategoryId: '14',
    amount: 285.50,
    description: 'Oil change and tire rotation',
    notes: 'Regular maintenance service',
    storeName: 'Jiffy Lube',
    storeLocation: 'Downtown',
    date: '2025-01-11',
    createdAt: '2025-01-11T11:00:00Z'
  },
  {
    id: '27',
    userId: '1',
    categoryId: '4',
    subcategoryId: '15',
    amount: 165.00,
    description: 'Monthly car insurance',
    storeName: 'State Farm',
    storeLocation: 'Online',
    date: '2025-01-01',
    createdAt: '2025-01-01T09:00:00Z'
  },
  {
    id: '28',
    userId: '1',
    categoryId: '4',
    subcategoryId: '16',
    amount: 12.00,
    description: 'Downtown parking',
    storeName: 'ParkWhiz',
    storeLocation: 'Downtown',
    date: '2025-01-14',
    createdAt: '2025-01-14T08:45:00Z'
  },

  // Automobile - Sarah Johnson
  {
    id: '29',
    userId: '2',
    categoryId: '4',
    subcategoryId: '13',
    amount: 52.30,
    description: 'Premium gas fill-up',
    storeName: 'Chevron',
    storeLocation: 'Uptown',
    date: '2025-01-15',
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: '30',
    userId: '2',
    categoryId: '4',
    subcategoryId: '14',
    amount: 450.00,
    description: 'Brake pad replacement',
    notes: 'Safety maintenance required',
    storeName: 'Firestone',
    storeLocation: 'Uptown',
    date: '2025-01-10',
    createdAt: '2025-01-10T14:30:00Z'
  },
  {
    id: '31',
    userId: '2',
    categoryId: '4',
    subcategoryId: '15',
    amount: 195.00,
    description: 'Monthly car insurance',
    storeName: 'Allstate',
    storeLocation: 'Online',
    date: '2025-01-01',
    createdAt: '2025-01-01T09:30:00Z'
  },
  {
    id: '32',
    userId: '2',
    categoryId: '4',
    subcategoryId: '16',
    amount: 25.00,
    description: 'Airport parking',
    storeName: 'SeaTac Airport',
    storeLocation: 'Airport',
    date: '2025-01-12',
    createdAt: '2025-01-12T06:00:00Z'
  },

  // Additional mixed expenses for variety
  {
    id: '33',
    userId: '1',
    categoryId: '1',
    subcategoryId: '1',
    amount: 38.90,
    description: 'Weekend farmers market haul',
    storeName: 'Pike Place Market',
    storeLocation: 'Downtown',
    date: '2025-01-11',
    createdAt: '2025-01-11T10:15:00Z'
  },
  {
    id: '34',
    userId: '2',
    categoryId: '1',
    subcategoryId: '2',
    amount: 29.85,
    description: 'Free-range eggs and cheese',
    storeName: 'Local Co-op',
    storeLocation: 'Uptown',
    date: '2025-01-11',
    createdAt: '2025-01-11T16:30:00Z'
  },
  {
    id: '35',
    userId: '1',
    categoryId: '3',
    subcategoryId: '12',
    amount: 9.99,
    description: 'Disney+ monthly subscription',
    storeName: 'Disney+',
    storeLocation: 'Online',
    date: '2025-01-01',
    createdAt: '2025-01-01T00:15:00Z'
  },
  {
    id: '36',
    userId: '2',
    categoryId: '3',
    subcategoryId: '10',
    amount: 35.99,
    description: 'Puzzle for rainy day',
    storeName: 'Target',
    storeLocation: 'Uptown',
    date: '2025-01-09',
    createdAt: '2025-01-09T13:45:00Z'
  },
  {
    id: '37',
    userId: '1',
    categoryId: '4',
    subcategoryId: '13',
    amount: 44.20,
    description: 'Mid-week gas fill-up',
    storeName: 'Arco',
    storeLocation: 'Downtown',
    date: '2025-01-08',
    createdAt: '2025-01-08T17:20:00Z'
  },
  {
    id: '38',
    userId: '2',
    categoryId: '4',
    subcategoryId: '16',
    amount: 8.50,
    description: 'Street parking meter',
    storeName: 'City Parking',
    storeLocation: 'Uptown',
    date: '2025-01-07',
    createdAt: '2025-01-07T14:10:00Z'
  },
  {
    id: '39',
    userId: '1',
    categoryId: '1',
    subcategoryId: '4',
    amount: 18.65,
    description: 'Late night snack run',
    storeName: '7-Eleven',
    storeLocation: 'Downtown',
    date: '2025-01-06',
    createdAt: '2025-01-06T23:30:00Z'
  },
  {
    id: '40',
    userId: '2',
    categoryId: '2',
    subcategoryId: '7',
    amount: 25.00,
    description: 'Mobile phone data overage',
    notes: 'Exceeded monthly limit',
    storeName: 'Verizon',
    storeLocation: 'Online',
    date: '2025-01-04',
    createdAt: '2025-01-04T16:00:00Z'
  }
];