import { Timestamp } from 'firebase/firestore';
import { DashboardStats, TimePeriod } from './types';
import { 
  getDateRangeForPeriod, 
  calculateConversionRate, 
  calculateAverageRedemptionValue 
} from './utils';
import { 
  getActiveCouponsCount, 
  getTotalRedemptionsCount, 
  getRedemptionsInPeriod 
} from './couponStats';
import { 
  getLoyalCustomersCount, 
  getCustomerData 
} from './customerStats';
import { getRecentActivity } from './activityService';

// Function to fetch dashboard stats
export const fetchDashboardStats = async (businessId: string): Promise<DashboardStats> => {
  try {
    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Get active coupons count
    const activeCoupons = await getActiveCouponsCount(businessId);
    
    // Get total redemptions count
    const totalRedemptions = await getTotalRedemptionsCount(businessId);
    
    // Get loyal customers count
    const loyalCustomers = await getLoyalCustomersCount(businessId);
    
    // Get customer data
    const { totalCustomers, revenueGenerated } = await getCustomerData(businessId);
    
    // Calculate conversion rate and average redemption value
    const conversionRate = calculateConversionRate(totalRedemptions, totalCustomers);
    const averageRedemptionValue = calculateAverageRedemptionValue(revenueGenerated, totalRedemptions);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(businessId, thirtyDaysAgo);
    
    return {
      activeCoupons,
      totalRedemptions,
      loyalCustomers,
      revenueGenerated,
      lastUpdated: new Date(),
      totalCustomers,
      conversionRate,
      averageRedemptionValue,
      recentActivity
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Function to fetch stats for a specific time period
export const fetchStatsByPeriod = async (
  businessId: string, 
  period: TimePeriod
): Promise<DashboardStats> => {
  try {
    // Calculate date range based on period
    const { startDate, endDate } = getDateRangeForPeriod(period);
    
    // Get active coupons count
    const activeCoupons = await getActiveCouponsCount(businessId);
    
    // Get redemptions within the period
    const totalRedemptions = await getRedemptionsInPeriod(businessId, startDate, endDate);
    
    // Get customer data
    const { totalCustomers, revenueGenerated } = await getCustomerData(businessId);
    
    // Get loyal customers count
    const loyalCustomers = await getLoyalCustomersCount(businessId);
    
    // Calculate conversion rate and average redemption value
    const conversionRate = calculateConversionRate(totalRedemptions, totalCustomers);
    const averageRedemptionValue = calculateAverageRedemptionValue(revenueGenerated, totalRedemptions);
    
    // Get recent activity for the period
    const recentActivity = await getRecentActivity(businessId, startDate);
    
    return {
      activeCoupons,
      totalRedemptions,
      loyalCustomers,
      revenueGenerated,
      lastUpdated: new Date(),
      totalCustomers,
      conversionRate,
      averageRedemptionValue,
      recentActivity
    };
  } catch (error) {
    console.error(`Error fetching stats for period ${period}:`, error);
    throw error;
  }
};