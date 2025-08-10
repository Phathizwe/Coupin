import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCustomerAnalytics } from '../../services/analyticsService';

export interface AnalyticsData {
  totalCustomers: number;
  couponsRedeemed: number;
  revenueGenerated: number;
  loyaltyMembers: number;
  customerGrowth: number;
  customerRetention: number;
  averageSpend: number;
}

export const fetchAnalyticsData = async (businessId: string, timeframe: string): Promise<AnalyticsData> => {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  try {
    // Get customer analytics from the service
    const customerAnalytics = await getCustomerAnalytics(businessId);
    
    // Get total customers count
    const customersRef = collection(db, 'customers');
    const customersQuery = query(customersRef, where('businessId', '==', businessId));
    const customersSnapshot = await getCountFromServer(customersQuery);
    const totalCustomers = customersSnapshot.data().count;
    
    // Get redeemed coupons count
    const customerCouponsRef = collection(db, 'customerCoupons');
    const redeemedCouponsQuery = query(
      customerCouponsRef, 
      where('businessId', '==', businessId),
      where('used', '==', true)
    );
    const redeemedCouponsSnapshot = await getCountFromServer(redeemedCouponsQuery);
    const couponsRedeemed = redeemedCouponsSnapshot.data().count;
    
    // Get loyalty members count (customers with loyalty points > 0)
    const loyaltyMembersQuery = query(
      customersRef,
      where('businessId', '==', businessId),
      where('loyaltyPoints', '>', 0)
    );
    const loyaltyMembersSnapshot = await getCountFromServer(loyaltyMembersQuery);
    const loyaltyMembers = loyaltyMembersSnapshot.data().count;
    
    // Get total revenue (sum of totalSpent from all customers)
    const customersDataQuery = query(customersRef, where('businessId', '==', businessId));
    const customersDataSnapshot = await getDocs(customersDataQuery);
    let totalRevenue = 0;
    customersDataSnapshot.forEach(doc => {
      const customerData = doc.data();
      totalRevenue += customerData.totalSpent || 0;
    });
    
    return {
      totalCustomers,
      couponsRedeemed,
      revenueGenerated: totalRevenue,
      loyaltyMembers,
      customerGrowth: customerAnalytics.customerGrowth.percentage,
      customerRetention: customerAnalytics.customerRetention.percentage,
      averageSpend: customerAnalytics.averageSpend.amount
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};