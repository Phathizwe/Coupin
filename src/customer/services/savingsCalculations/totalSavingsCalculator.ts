import { 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getSearchIds, estimateCouponValue } from './savingsHelpers';

/**
 * Calculates the total amount saved from all redeemed coupons
 * @param userId User ID to calculate savings for
 * @returns Total amount saved in currency units
 */
export const calculateTotalSaved = async (userId: string): Promise<number> => {
  try {
    // Get IDs to search (user ID and possibly customer ID)
    const idsToSearch = await getSearchIds(userId);
    
    // Get all redeemed coupon IDs from couponDistributions
    const redeemedCouponIds = new Set<string>();
    
    for (const id of idsToSearch) {
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        where('customerId', '==', id),
        where('status', '==', 'redeemed')
      );
      
      const snapshot = await getDocs(distributionsQuery);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId) {
          redeemedCouponIds.add(data.couponId);
        }
      });
    }
    
    // If no redeemed coupons, return 0
    if (redeemedCouponIds.size === 0) {
      return 0;
    }
    
    // Get coupon details to calculate savings
    let totalSavings = 0;
    
    // Process in batches of 10 to avoid query limitations
    const couponIdsArray = Array.from(redeemedCouponIds);
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
        totalSavings += estimateCouponValue(couponData);
      });
    }
    
    return Math.round(totalSavings); // Round to nearest whole number
  } catch (error) {
    console.error('Error calculating total saved:', error);
    return 0;
  }
};