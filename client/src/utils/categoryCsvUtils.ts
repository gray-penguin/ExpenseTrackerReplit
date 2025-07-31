import { Category, Subcategory } from '../types';

export interface CSVCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategoryId: string;
  subcategoryName: string;
}

// Helper function to get next available numeric ID
const getNextCategoryId = (existingCategories: Category[]): string => {
  const existingIds = existingCategories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return (maxId + 1).toString();
};

const getNextSubcategoryId = (existingCategories: Category[]): string => {
  const allSubcategoryIds = existingCategories.flatMap(cat => 
    cat.subcategories.map(sub => parseInt(sub.id))
  ).filter(id => !isNaN(id));
  
  const maxId = allSubcategoryIds.length > 0 ? Math.max(...allSubcategoryIds) : 0;
  return (maxId + 1).toString();
};

export const exportCategoriesToCSV = (categories: Category[]): string => {
  const headers = [
    'Category ID',
    'Category Name',
    'Category Icon',
    'Category Color',
    'Subcategory ID',
    'Subcategory Name'
  ];

  const csvData: string[][] = [];

  categories.forEach(category => {
    if (category.subcategories.length === 0) {
      // Category with no subcategories
      csvData.push([
        category.id,
        `"${category.name.replace(/"/g, '""')}"`,
        category.icon,
        category.color,
        '',
        ''
      ]);
    } else {
      // Category with subcategories
      category.subcategories.forEach(subcategory => {
        csvData.push([
          category.id,
          `"${category.name.replace(/"/g, '""')}"`,
          category.icon,
          category.color,
          subcategory.id,
          `"${subcategory.name.replace(/"/g, '""')}"`
        ]);
      });
    }
  });

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

export const parseCSVContent = (csvContent: string): CSVCategory[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const expectedHeaders = [
    'Category ID', 'Category Name', 'Category Icon', 'Category Color',
    'Subcategory ID', 'Subcategory Name'
  ];

  // Validate headers (case insensitive)
  const missingHeaders = expectedHeaders.filter(header => 
    !headers.some(h => h.toLowerCase() === header.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const data: CSVCategory[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      if (values.length < expectedHeaders.length) {
        throw new Error(`Row ${i + 1}: Insufficient columns`);
      }

      const csvCategory: CSVCategory = {
        id: values[0] || '',
        name: values[1] || '',
        icon: values[2] || 'Tag',
        color: values[3] || 'text-blue-600',
        subcategoryId: values[4] || '',
        subcategoryName: values[5] || ''
      };

      // Validate required fields
      if (!csvCategory.id || !csvCategory.name) {
        throw new Error(`Row ${i + 1}: Category ID and Name are required`);
      }

      // If subcategory ID is provided, subcategory name is required
      if (csvCategory.subcategoryId && !csvCategory.subcategoryName) {
        throw new Error(`Row ${i + 1}: Subcategory name is required when subcategory ID is provided`);
      }

      data.push(csvCategory);
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

export const validateImportData = (
  csvCategories: CSVCategory[]
): { validCategories: Category[]; errors: string[] } => {
  const validCategories: Category[] = [];
  const errors: string[] = [];
  const categoryMap = new Map<string, Category>();
  const usedCategoryIds = new Set<string>();
  const usedSubcategoryIds = new Set<string>();

  // Valid icon options - updated to match actual Lucide React exports
  const validIcons = [
    'UtensilsCrossed', 'Utensils', 'Car', 'Music', 'ShoppingBag', 'Receipt', 'Heart',
    'Home', 'Plane', 'Book', 'Coffee', 'Gamepad2', 'Shirt',
    'Fuel', 'Phone', 'Wifi', 'Zap', 'Briefcase', 'GraduationCap',
    'Baby', 'PawPrint', 'Wrench', 'Gift', 'Camera', 'Dumbbell', 'Tag',
    'Wine', 'Pizza', 'Cake', 'Apple', 'Beef', 'Fish', 'Salad',
    'IceCreamCone', 'Cookie', 'ChefHat', 'Bike', 'Bus', 'Train',
    'Ship', 'Truck', 'ParkingCircle', 'Navigation', 'MapPin', 'Compass',
    'Headphones', 'Radio', 'Tv', 'Monitor', 'Joystick', 'Video',
    'Film', 'Mic', 'Speaker', 'Volume2', 'ShoppingCart', 'Store',
    'Package', 'CreditCard', 'Wallet', 'ScanLine', 'Watch',
    'Activity', 'PersonStanding', 'Footprints', 'Thermometer',
    'Stethoscope', 'Pill', 'Cross', 'Shield', 'Lightbulb',
    'Smartphone', 'Laptop', 'WashingMachine', 'Refrigerator',
    'Sofa', 'Bed', 'Building', 'Building2', 'Factory', 'Calculator',
    'FileText', 'Folder', 'Mail', 'Users', 'UserCheck', 'BookOpen',
    'Library', 'PenTool', 'Edit', 'Globe', 'Award', 'Trophy',
    'Map', 'Luggage', 'Binoculars', 'Tent', 'Mountain', 'Palmtree',
    'Sun', 'DollarSign', 'PiggyBank', 'TrendingUp', 'TrendingDown',
    'BarChart3', 'PieChart', 'Coins', 'Tablet', 'Keyboard', 'Mouse',
    'Printer', 'HardDrive', 'Bluetooth', 'Scissors', 'Brush',
    'Sparkles', 'Droplets', 'Moon', 'Eye', 'Smile', 'Star',
    'Flower', 'Leaf', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Squirrel',
    'Bug', 'Turtle', 'Bone', 'Palette', 'Guitar', 'Piano',
    'Puzzle', 'Dice1', 'Target', 'Telescope', 'Microscope',
    'Circle', 'Square', 'Triangle', 'Diamond', 'Bookmark',
    'Flag', 'Bell', 'Clock', 'Calendar', 'Hash', 'Plus'
  ];

  // Valid color options
  const validColors = [
    'text-red-600', 'text-orange-600', 'text-amber-600', 'text-yellow-600',
    'text-lime-600', 'text-green-600', 'text-emerald-600', 'text-teal-600',
    'text-cyan-600', 'text-sky-600', 'text-blue-600', 'text-indigo-600',
    'text-violet-600', 'text-purple-600', 'text-fuchsia-600', 'text-pink-600',
    'text-rose-600', 'text-slate-600'
  ];

  // Generate new numeric IDs for all categories and subcategories
  let nextCategoryId = 1;
  let nextSubcategoryId = 1;

  csvCategories.forEach((csvCategory, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

    try {
      // Validate icon
      if (!validIcons.includes(csvCategory.icon)) {
        csvCategory.icon = 'Tag'; // Default fallback
      }

      // Validate color
      if (!validColors.includes(csvCategory.color)) {
        csvCategory.color = 'text-blue-600'; // Default fallback
      }

      // Generate new numeric category ID
      let categoryId = nextCategoryId.toString();
      
      // Get or create category
      let category = categoryMap.get(csvCategory.name.toLowerCase());
      if (!category) {
        category = {
          id: categoryId,
          name: csvCategory.name,
          icon: csvCategory.icon,
          color: csvCategory.color,
          subcategories: []
        };
        categoryMap.set(csvCategory.name.toLowerCase(), category);
        usedCategoryIds.add(categoryId);
        nextCategoryId++;
      } else {
        // Use existing category ID
        categoryId = category.id;
      }

      // Add subcategory if provided
      if (csvCategory.subcategoryId && csvCategory.subcategoryName) {
        // Check if subcategory already exists in this category
        const existingSubcategory = category.subcategories.find(
          sub => sub.name.toLowerCase() === csvCategory.subcategoryName.toLowerCase()
        );

        if (!existingSubcategory) {
          const subcategoryId = nextSubcategoryId.toString();
          const subcategory: Subcategory = {
            id: subcategoryId,
            name: csvCategory.subcategoryName,
            categoryId: categoryId
          };
          category.subcategories.push(subcategory);
          usedSubcategoryIds.add(subcategoryId);
          nextSubcategoryId++;
        }
      }
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
    }
  });

  // Convert map to array
  validCategories.push(...Array.from(categoryMap.values()));

  return { validCategories, errors };
};

export const generateCategoryTemplate = (): string => {
  const template = [
    'Category ID,Category Name,Category Icon,Category Color,Subcategory ID,Subcategory Name',
    '1,"Food & Dining",UtensilsCrossed,text-orange-600,1,Groceries',
    '1,"Food & Dining",UtensilsCrossed,text-orange-600,2,Restaurants',
    '2,Transportation,Car,text-blue-600,3,Gas',
    '2,Transportation,Car,text-blue-600,4,"Public Transit"',
    '3,Entertainment,Music,text-purple-600,5,Movies'
  ].join('\n');

  return template;
};