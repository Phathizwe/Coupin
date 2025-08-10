import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer, 
  Timestamp, 
  orderBy as firestoreOrderBy, 
  limit as firestoreLimit,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp as FirestoreTimestamp
} from 'firebase/firestore';
import { performanceMonitor } from '../utils/performanceMonitor';

// Export the types that are used by other components
export interface ActivityItem {
  id: string;
  type: 'coupon_created' | 'coupon_redeemed' | 'customer_added' | 'customer_visit';
  title: string;
  timestamp: Date | FirestoreTimestamp; // Allow for Firestore Timestamp objects
  entityId: string;
  details?: string;
}

export interface DashboardStats {
  activeCoupons: number;
  totalRedemptions: number;
  loyalCustomers: number;
  revenueGenerated: number;
  totalCustomers?: number;
  conversionRate?: number;
  averageRedemptionValue?: number;
  recentActivity?: ActivityItem[];
  lastUpdated?: Date;
}

// Helper function to convert Firestore timestamps to JS Date objects
export function toJsDate(timestamp: FirestoreTimestamp | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  return new Date();
}
/**
 * Original fetchDashboardStats function to maintain compatibility
 */
export async function fetchDashboardStats(businessId: string): Promise<DashboardStats> {
  try {
    const startTime = performance.now();
    
    // Get active coupons
    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(
      couponsRef,
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    const couponsSnapshot = await getDocs(couponsQuery);
    const activeCoupons = couponsSnapshot.docs.length;
    
    // Get redemptions
    const customerCouponsRef = collection(db, 'customerCoupons');
    const redemptionsQuery = query(
      customerCouponsRef,
      where('businessId', '==', businessId),
      where('used', '==', true)
    );
    const redemptionsSnapshot = await getDocs(redemptionsQuery);
    const totalRedemptions = redemptionsSnapshot.docs.length;
    
    // Get customer count
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('businessId', '==', businessId)
    );
    const customersSnapshot = await getDocs(customersQuery);
    const totalCustomers = customersSnapshot.docs.length;
    
    // Calculate loyal customers (customers with more than 2 redemptions)
    const customerRedemptionCounts: Record<string, number> = {};
    
    redemptionsSnapshot.forEach(doc => {
      const data = doc.data();
      const customerId = data.customerId;
      
      if (!customerRedemptionCounts[customerId]) {
        customerRedemptionCounts[customerId] = 0;
  }
      
      customerRedemptionCounts[customerId]++;
    });
    
    const loyalCustomers = Object.values(customerRedemptionCounts)
      .filter(count => count >= 2)
      .length;
    
    // Get recent activity
    const recentActivity = await getRecentActivity(businessId, 10);
    
    // Calculate conversion rate if possible
    let conversionRate = undefined;
    if (totalCustomers > 0 && totalRedemptions > 0) {
      conversionRate = (totalRedemptions / totalCustomers) * 100;
}

    const endTime = performance.now();
    performanceMonitor.trackQueryPerformance('dashboard_stats', startTime, endTime);
    
    return {
      activeCoupons,
      totalRedemptions,
      loyalCustomers,
      revenueGenerated: 0, // This would need a more complex calculation
      totalCustomers,
      conversionRate,
      recentActivity,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    performanceMonitor.trackQueryError('dashboard_stats', error);
    
    // Return empty stats on error to prevent UI crashes
    return {
      activeCoupons: 0,
      totalRedemptions: 0,
      loyalCustomers: 0,
      revenueGenerated: 0,
      lastUpdated: new Date()
    };
  }
}

/**
 * Optimized version of fetchDashboardStats that uses more efficient queries
 * and parallel processing to speed up dashboard loading
 */
export async function fetchDashboardStatsOptimized(businessId: string): Promise<DashboardStats> {
  const startTime = performance.now();
  
  try {
    // Create all promises for parallel execution
    const activeCouponsPromise = getCountFromServer(
      query(
        collection(db, 'coupons'),
        where('businessId', '==', businessId),
        where('active', '==', true)
      )
    );
    
    const redemptionsPromise = getCountFromServer(
      query(
        collection(db, 'customerCoupons'),
        where('businessId', '==', businessId),
        where('used', '==', true)
      )
    );
    
    const loyalCustomersPromise = getLoyalCustomersCount(businessId);
    
    const recentActivityPromise = getRecentActivity(businessId, 5);
    
    // Execute all promises in parallel
    const [
      activeCouponsSnapshot,
      redemptionsSnapshot,
      loyalCustomers,
      recentActivity
    ] = await Promise.all([
      activeCouponsPromise,
      redemptionsPromise,
      loyalCustomersPromise,
      recentActivityPromise
    ]);
    
    // Build the dashboard stats object
    const stats: DashboardStats = {
      activeCoupons: activeCouponsSnapshot.data().count,
      totalRedemptions: redemptionsSnapshot.data().count,
      loyalCustomers,
      revenueGenerated: 0, // This would need a more complex calculation
      totalCustomers: 0,   // We'll set this separately
      recentActivity,
      lastUpdated: new Date()
    };
    
    // Get total customers count (separate query to keep the main ones fast)
    const customersCountSnapshot = await getCountFromServer(
      query(collection(db, 'customers'), where('businessId', '==', businessId))
    );
    stats.totalCustomers = customersCountSnapshot.data().count;
    
    // Calculate conversion rate if possible
    if (stats.totalCustomers > 0 && stats.totalRedemptions > 0) {
      stats.conversionRate = (stats.totalRedemptions / stats.totalCustomers) * 100;
    }
    
    const endTime = performance.now();
    performanceMonitor.trackQueryPerformance('optimized_dashboard_stats', startTime, endTime);
    
    return stats;
    
  } catch (error) {
    performanceMonitor.trackQueryError('optimized_dashboard_stats', error);
    console.error('Error fetching optimized dashboard stats:', error);
    
    // Return empty stats on error to prevent UI crashes
    return {
      activeCoupons: 0,
      totalRedemptions: 0,
      loyalCustomers: 0,
      revenueGenerated: 0,
      totalCustomers: 0,
      lastUpdated: new Date()
    };
  }
}

/**
 * Get count of loyal customers (customers with more than 2 redemptions)
 */
async function getLoyalCustomersCount(businessId: string): Promise<number> {
  try {
    // First get all customer IDs with redemptions
    const customerCouponsRef = collection(db, 'customerCoupons');
    const customerCouponsQuery = query(
      customerCouponsRef,
      where('businessId', '==', businessId),
      where('used', '==', true)
    );
    
    const snapshot = await getDocs(customerCouponsQuery);
    
    // Count customers with more than 2 redemptions
    const customerRedemptionCounts: Record<string, number> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const customerId = data.customerId;
      
      if (!customerRedemptionCounts[customerId]) {
        customerRedemptionCounts[customerId] = 0;
      }
      
      customerRedemptionCounts[customerId]++;
    });
    
    // Count customers with more than 2 redemptions
    const loyalCustomersCount = Object.values(customerRedemptionCounts)
      .filter(count => count >= 2)
      .length;
      
    return loyalCustomersCount;
    
  } catch (error) {
    console.error('Error getting loyal customers count:', error);
    return 0;
  }
}

/**
 * Get recent activity for the dashboard
 */
async function getRecentActivity(businessId: string, limitCount: number): Promise<ActivityItem[]> {
  try {
    // For this example, we'll just get the most recent coupon creations
    // In a real implementation, you would combine multiple activity types
    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(
      couponsRef,
      where('businessId', '==', businessId),
      firestoreOrderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const snapshot = await getDocs(couponsQuery);
    
    const activities: ActivityItem[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'coupon_created',
        title: `New coupon created: ${data.title || 'Untitled'}`,
        timestamp: data.createdAt || new Date(),
        entityId: doc.id,
        details: data.description || ''
      };
    });
    
    return activities;
    
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}