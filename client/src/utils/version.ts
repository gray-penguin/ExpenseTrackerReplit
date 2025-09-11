export const APP_VERSION = '2.0.1';
export const VERSION_HISTORY = [
  {
    version: '2.0.1',
    date: '2025-09-10',
    changes: [
      'Fixed Reports page cell click functionality to show expense details modal',
      'Restored popup window for viewing expenses when clicking on report totals',
      'Fixed missing X icon import causing modal close button errors',
      'Enhanced expense details modal with user avatars and formatted data',
      'Improved modal styling and responsive design for better user experience'
    ]
  },
  {
    version: '2.0.0',
    date: '2025-09-06',
    changes: [
      'Enhanced form dropdown suggestions for ExpenseForm',
      'Intelligent autocomplete for Description, Store Name, and Store Location fields',
      'Frequency-based sorting with recency weighting for suggestions',
      'Visual chevron dropdown indicators',
      'Fixed data source to use actual expenses instead of mock data'
      'Removed all Tauri code'
    ]
  },
  {
    version: '1.9.0',
    date: '2025-07-27',
    changes: [
      'Added Tauri setup for native macOS app creation',
      'Complete Tauri project structure with Rust backend',
      'Ready for .app/.dmg bundle creation',
      'Documented setup process in TAURI_SETUP.md'
    ]
  },
  {
    version: '1.8.0',
    date: '2025-07-27',
    changes: [
      'Cleaned up offline desktop application code',
      'Removed offline-app directory and related files',
      'Streamlined codebase to focus on web application',
      'Maintained all core functionality'
    ]
  },
  {
    version: '1.7.0',
    date: '2025-07-26',
    changes: [
      'Fixed Reports page monthly totals display',
      'Enhanced ExpenseForm amount data type handling',
      'Resolved $NaN issues in calculations',
      'Improved data validation throughout reporting'
    ]
  },
  {
    version: '1.6.0',
    date: '2025-07-25',
    changes: [
      'UI text cleanup and bug fixes',
      'Fixed edit form data population',
      'Resolved double confirmation popups',
      'Type conflict resolution in ExpenseForm'
    ]
  },
  {
    version: '1.5.0',
    date: '2025-07-23',
    changes: [
      'Comprehensive About This App section',
      'Visual feature highlights with icons',
      'Technical specifications documentation',
      'Privacy & security information'
    ]
  },
  {
    version: '1.4.0',
    date: '2025-07-23',
    changes: [
      'Fixed Dashboard subcategory navigation',
      'Improved wouter router compatibility',
      'Enhanced form accessibility',
      'Cleaned up debug logging'
    ]
  },
  {
    version: '1.3.0',
    date: '2025-07-21',
    changes: [
      'Restored Dashboard subcategory navigation',
      'URL parameter support for filtering',
      'Enhanced ExpensesList component',
      'Seamless navigation between dashboard and expenses'
    ]
  },
  {
    version: '1.2.0',
    date: '2025-07-21',
    changes: [
      'Fixed bulk expense form bug',
      'Created dedicated addBulkExpenses function',
      'Enhanced ID generation for uniqueness',
      'Resolved React state batching conflicts'
    ]
  },
  {
    version: '1.1.0',
    date: '2025-07-20',
    changes: [
      'Restored complete login/logout functionality',
      'Browser state management using localStorage',
      'Comprehensive Reports page with analytics',
      'CSV import/export functionality'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-07-20',
    changes: [
      'Multi-user expense tracking',
      'Category and subcategory management',
      'Dashboard with real-time statistics',
      'Progressive Web App functionality'
    ]
  }
];

export const getVersionInfo = () => {
  return {
    current: APP_VERSION,
    history: VERSION_HISTORY,
    buildDate: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
};

export const formatVersion = (version: string): string => {
  return `v${version}`;
};

export const isNewerVersion = (version1: string, version2: string): boolean => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return true;
    if (v1Part < v2Part) return false;
  }
  
  return false;
};