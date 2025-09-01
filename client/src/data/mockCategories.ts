import { Category } from '../types';

// Family expense categories with subcategories
export const mockCategories: Omit<Category, 'id'>[] = [
  {
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