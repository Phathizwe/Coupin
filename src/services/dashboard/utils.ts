import { FirestoreTimestamp } from './types';

// Utility function to safely convert any timestamp to a JavaScript Date
export const toJsDate = (timestamp: Date | FirestoreTimestamp | any): Date => {
  if (timestamp && typeof timestamp === 'object') {
    // Check if it's a Firestore Timestamp with toDate method
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Check if it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // Check if it has seconds and nanoseconds (Firestore Timestamp format)
    if ('seconds' in timestamp && 'nanoseconds' in timestamp) {
      // Convert to milliseconds and create a Date
      return new Date((timestamp.seconds * 1000) + (timestamp.nanoseconds / 1000000));
    }
  }
  // If it's a string or number, or we couldn't determine the type, create a new Date
  return new Date(timestamp);
};

// Calculate date range based on period
export const getDateRangeForPeriod = (period: 'day' | 'week' | 'month' | 'year'): { startDate: Date, endDate: Date } => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { startDate, endDate: now };
};

// Calculate conversion rate
export const calculateConversionRate = (redemptions: number, customers: number): number => {
  return customers > 0 ? parseFloat(((redemptions / customers) * 100).toFixed(1)) : 0;
};

// Calculate average redemption value
export const calculateAverageRedemptionValue = (revenue: number, redemptions: number): number => {
  return redemptions > 0 ? parseFloat((revenue / redemptions).toFixed(2)) : 0;
};