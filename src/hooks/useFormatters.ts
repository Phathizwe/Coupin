import { useRegionalSettings } from '@/contexts/RegionalSettingsContext';

export function useFormatters() {
  const { formatCurrency, formatDate, formatTime, formatDateTime } = useRegionalSettings();

  return {
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    
    // Additional convenience formatters
    formatShortDate: (date: Date | string | number): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return formatDate(dateObj);
    },
    
    formatMonthYear: (date: Date | string | number): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric'
      }).format(dateObj);
    },
    
    formatRelativeTime: (date: Date | string | number): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return formatDate(dateObj);
    }
  };
}