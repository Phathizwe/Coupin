// Define the activity item interface
export interface ActivityItem {
  id: string;
  type: 'coupon_created' | 'coupon_redeemed' | 'customer_added' | 'customer_visit';
  title: string;
  timestamp: Date | FirestoreTimestamp; // Allow for Firestore Timestamp objects
  entityId: string;
  details?: string;
}

// Define a simple interface for Firestore Timestamp-like objects
export interface FirestoreTimestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
}

// Define the DashboardStats interface
export interface DashboardStats {
  activeCoupons: number;
  totalRedemptions: number;
  loyalCustomers: number;
  revenueGenerated: number;
  // Add any other properties that might be in the stats object
  lastUpdated?: Date;
  totalCustomers?: number;
  conversionRate?: number;
  averageRedemptionValue?: number;
  recentActivity?: ActivityItem[]; // Add the recentActivity property
}

// Define time period type
export type TimePeriod = 'day' | 'week' | 'month' | 'year';