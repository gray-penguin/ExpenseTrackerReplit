import { User } from '../types';

export interface CSVUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  color: string;
  defaultCategoryId: string;
  defaultSubcategoryId: string;
  defaultStoreLocation: string;
}

export const exportUsersToCSV = (users: User[]): string => {
  const headers = [
    'User ID',
    'Name',
    'Username',
    'Email',
    'Avatar',
    'Color',
    'Default Category ID',
    'Default Subcategory ID',
    'Default Store Location'
  ];

  const csvData = users.map(user => [
    user.id,
    `"${user.name.replace(/"/g, '""')}"`,
    user.username,
    user.email,
    user.avatar,
    user.color,
    user.defaultCategoryId || '',
    user.defaultSubcategoryId || '',
    `"${(user.defaultStoreLocation || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSVContent = (csvContent: string): CSVUser[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = [
    'User ID', 'Name', 'Username', 'Email', 'Avatar', 'Color',
    'Default Category ID', 'Default Subcategory ID', 'Default Store Location'
  ];

  // Validate headers (case insensitive)
  const missingHeaders = expectedHeaders.filter(header => 
    !headers.some(h => h.toLowerCase() === header.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const data: CSVUser[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      if (values.length < expectedHeaders.length) {
        throw new Error(`Row ${i + 1}: Insufficient columns`);
      }

      const csvUser: CSVUser = {
        id: values[0] || '',
        name: values[1] || '',
        username: values[2] || '',
        email: values[3] || '',
        avatar: values[4] || '',
        color: values[5] || 'bg-blue-500',
        defaultCategoryId: values[6] || '',
        defaultSubcategoryId: values[7] || '',
        defaultStoreLocation: values[8] || ''
      };

      // Validate required fields
      if (!csvUser.name || !csvUser.username || !csvUser.email) {
        throw new Error(`Row ${i + 1}: Name, Username, and Email are required`);
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(csvUser.username)) {
        throw new Error(`Row ${i + 1}: Username must be 3-20 characters, letters, numbers, and underscores only`);
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(csvUser.email)) {
        throw new Error(`Row ${i + 1}: Invalid email format`);
      }

      data.push(csvUser);
    } catch (error) {
      throw new Error(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  }

  return data;
};

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  values.push(current.trim());

  return values;
};

// Helper function to generate initials from name
const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get next available numeric ID
const getNextUserId = (existingUsers: User[]): string => {
  const existingIds = existingUsers.map(user => parseInt(user.id)).filter(id => !isNaN(id));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString();
};

export const validateImportData = (
  csvUsers: CSVUser[],
  existingUsers: User[]
): { validUsers: User[]; errors: string[] } => {
  const validUsers: User[] = [];
  const errors: string[] = [];
  const usedUsernames = new Set<string>();
  const usedEmails = new Set<string>();

  // Valid color options
  const validColors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500', 'bg-slate-500'
  ];

  // Generate new numeric IDs starting from the next available ID
  let nextUserId = 1;
  if (existingUsers.length > 0) {
    const existingIds = existingUsers.map(user => parseInt(user.id)).filter(id => !isNaN(id));
    nextUserId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  }

  csvUsers.forEach((csvUser, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

    try {
      let userName = csvUser.name.trim();
      let username = csvUser.username.trim().toLowerCase();
      let email = csvUser.email.trim().toLowerCase();

      // Check for duplicate usernames in CSV
      if (usedUsernames.has(username)) {
        errors.push(`Row ${rowNumber}: Duplicate username "${username}"`);
        return;
      }

      // Check for duplicate emails in CSV
      if (usedEmails.has(email)) {
        errors.push(`Row ${rowNumber}: Duplicate email "${email}"`);
        return;
      }

      // Check if username already exists in existing users
      if (existingUsers.some(user => user.username === username)) {
        errors.push(`Row ${rowNumber}: Username "${username}" already exists`);
        return;
      }

      // Check if email already exists in existing users
      if (existingUsers.some(user => user.email === email)) {
        errors.push(`Row ${rowNumber}: Email "${email}" already exists`);
        return;
      }

      // Validate and fix color
      let userColor = csvUser.color;
      if (!validColors.includes(userColor)) {
        userColor = 'bg-blue-500'; // Default fallback
        console.warn(`Row ${rowNumber}: Invalid color "${csvUser.color}", using default`);
      }

      // Generate avatar if not provided or invalid
      let userAvatar = csvUser.avatar.trim();
      if (!userAvatar || userAvatar.length > 2) {
        userAvatar = generateInitials(userName);
      }

      // Generate new numeric ID
      const userId = nextUserId.toString();
      nextUserId++;

      const user: User = {
        id: userId,
        name: userName,
        username: username,
        email: email,
        avatar: userAvatar,
        color: userColor,
        defaultCategoryId: csvUser.defaultCategoryId || undefined,
        defaultSubcategoryId: csvUser.defaultSubcategoryId || undefined,
        defaultStoreLocation: csvUser.defaultStoreLocation || undefined
      };

      validUsers.push(user);
      usedUsernames.add(username);
      usedEmails.add(email);

    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  });

  return { validUsers, errors };
};

export const generateUserTemplate = (): string => {
  const template = [
    'User ID,Name,Username,Email,Avatar,Color,Default Category ID,Default Subcategory ID,Default Store Location',
    '1,"Alex Chen",alexc,alex.chen@example.com,AC,bg-emerald-500,1,1,"Downtown Seattle"',
    '2,"Sarah Johnson",sarahj,sarah.johnson@example.com,SJ,bg-blue-500,2,3,"Capitol Hill"',
    '3,"Mike Rodriguez",miker,mike.rodriguez@example.com,MR,bg-purple-500,3,5,Bellevue',
    '4,"Emma Wilson",emmaw,emma.wilson@example.com,EW,bg-pink-500,1,2,"Queen Anne"'
  ].join('\n');

  return template;
};