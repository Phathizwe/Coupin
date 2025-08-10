// Define a simple interface for Firestore Timestamp-like objects
export interface FirestoreTimestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
}

/**
 * Convert a Firestore Timestamp or string date to a JavaScript Date object
 * @param date Date to convert
 * @returns JavaScript Date object
 */
export const toJsDate = (date: any): Date => {
  if (!date) return new Date();
  
  // If it's already a Date object, return it
  if (date instanceof Date) return date;
  
  // If it has a toDate method (Firestore Timestamp), use it
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // If it's a string or number, create a new Date
  return new Date(date);
};

/**
 * Format a date in a user-friendly format
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  // Format options
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format time in a user-friendly format (HH:MM AM/PM)
 * @param date Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }
  
  // Format options
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return dateObj.toLocaleTimeString('en-US', options);
};

/**
 * Get a human-readable time ago string (e.g., "2 days ago")
 * @param date Date to format
 * @returns Time ago string
 */
export const formatTimeAgo = (date: Date | string): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

// Also export timeAgo as an alias for backward compatibility
export const timeAgo = formatTimeAgo;