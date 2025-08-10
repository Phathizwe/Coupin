import { ActivityItem } from './types';
import { toJsDate } from './utils';
import { getRecentCouponCreations, getRecentCouponRedemptions } from './couponStats';

// Get all recent activity
export const getRecentActivity = async (
  businessId: string,
  startDate: Date
): Promise<ActivityItem[]> => {
  try {
    // Get recent coupon creations
    const couponCreations = await getRecentCouponCreations(businessId, startDate);
    
    // Get recent coupon redemptions
    const couponRedemptions = await getRecentCouponRedemptions(businessId, startDate);
    
    // Combine all activities
    const allActivities = [...couponCreations, ...couponRedemptions];
    
    // Sort activity by timestamp (newest first)
    allActivities.sort((a, b) => {
      const dateA = toJsDate(a.timestamp);
      const dateB = toJsDate(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Limit to most recent 15 activities
    return allActivities.slice(0, 15);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};