import { User } from '../types';

// Jones family members
export const mockUsers: Omit<User, 'id'>[] = [
  {
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