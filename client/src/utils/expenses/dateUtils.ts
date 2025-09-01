import { DateRangePreset, DateRange } from '../../components/expenses/ExpenseFilters';

// Helper function to format date to YYYY-MM-DD
export const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get date range based on preset
export const getDateRangeFromPreset = (preset: DateRangePreset, customDateRange: DateRange): DateRange | null => {
  const today = new Date();
  const todayStr = formatDateForComparison(today);
  
  switch (preset) {
    case 'all':
      return null;
    
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForComparison(yesterday);
      return { startDate: yesterdayStr, endDate: yesterdayStr };
    }
    
    case 'thisWeek': {
      const startOfWeek = new Date(today);
      // Get Sunday as start of week
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        startDate: formatDateForComparison(startOfWeek),
        endDate: formatDateForComparison(endOfWeek)
      };
    }
    
    case 'lastWeek': {
      const startOfLastWeek = new Date(today);
      const dayOfWeek = startOfLastWeek.getDay();
      startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
      
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      
      return {
        startDate: formatDateForComparison(startOfLastWeek),
        endDate: formatDateForComparison(endOfLastWeek)
      };
    }
    
    case 'thisMonth': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      return {
        startDate: formatDateForComparison(startOfMonth),
        endDate: formatDateForComparison(endOfMonth)
      };
    }
    
    case 'lastMonth': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      
      return {
        startDate: formatDateForComparison(startOfLastMonth),
        endDate: formatDateForComparison(endOfLastMonth)
      };
    }
    
    case 'thisYear': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      
      return {
        startDate: formatDateForComparison(startOfYear),
        endDate: formatDateForComparison(endOfYear)
      };
    }
    
    case 'custom':
      return customDateRange.startDate && customDateRange.endDate ? customDateRange : null;
    
    default:
      return null;
  }
};

export const getDateRangeLabel = (preset: DateRangePreset, customDateRange: DateRange): string => {
  const dateRange = getDateRangeFromPreset(preset, customDateRange);
  if (!dateRange) return '';
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: dateStr.split('-')[0] !== new Date().getFullYear().toString() ? 'numeric' : undefined
    });
  };
  
  if (dateRange.startDate === dateRange.endDate) {
    return formatDate(dateRange.startDate);
  }
  
  return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
};