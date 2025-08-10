import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getSearchIds, estimateCouponValue } from './savingsHelpers';

/**
 * Calculates the amount saved in the current month
 * @param userId User ID to calculate savings for
 * @returns Amount saved in the current month
 */
export const calculateMonthlySaved = async (userId: string): Promise<number> => {
  try {
    // Get IDs to search (user ID and possibly customer ID)
    const idsToSearch = await getSearchIds(userId);
    
    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
    
    // Get all redeemed coupons from the current month
    const monthlyCouponIds = new Set<string>();
    
    for (const id of idsToSearch) {
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        where('customerId', '==', id),
        where('status', '==', 'redeemed'),
        where('redeemedAt', '>=', startOfMonthTimestamp)
      );
      
      const snapshot = await getDocs(distributionsQuery);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId) {
          monthlyCouponIds.add(data.couponId);
        }
      });
    }
    
    // If no redeemed coupons this month, return 0
    if (monthlyCouponIds.size === 0) {
      return 0;
    }
    
    // Get coupon details to calculate monthly savings
    let monthlySavings = 0;
    
    // Process in batches of 10 to avoid query limitations
    const couponIdsArray = Array.from(monthlyCouponIds);
    for (let i = 0; i < couponIdsArray.length; i += 10) {
      const batch = couponIdsArray.slice(i, i + 10);
      
      // Get coupon details for this batch
      const couponsRef = collection(db, 'coupons');
      const couponsQuery = query(
        couponsRef,
        where('__name__', 'in', batch)
      );
      
      const couponsSnapshot = await getDocs(couponsQuery);
      
      // Calculate savings based on coupon type and value
      couponsSnapshot.docs.forEach(doc => {
        const couponData = doc.data();
        monthlySavings += estimateCouponValue(couponData);
      });
    }
    
    return Math.round(monthlySavings); // Round to nearest whole number
  } catch (error) {
    console.error('Error calculating monthly saved:', error);
    return 0;
  }
};