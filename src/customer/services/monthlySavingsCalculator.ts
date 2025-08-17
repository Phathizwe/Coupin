import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { findCustomerByUserId } from '../../services/customerLinkingService';

/**
 * Calculate the amount saved by a user in the current month
 * @param userId User ID to calculate savings for
 * @returns Amount saved this month
 */
export const calculateMonthlySaved = async (userId: string): Promise<number> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to calculateMonthlySaved');
      return 0;
    }

    // Get all IDs to search for (user ID and possibly customer ID)
    const idsToSearch = [userId];
    
    try {
      // Check if the user has a linked customer profile
      const customer = await findCustomerByUserId(userId);
      if (customer?.id) {
        idsToSearch.push(customer.id);
      }
    } catch (error) {
      console.warn('Error finding linked customer in monthly savings calculator:', error);
      // Continue with just the user ID
    }
    
    // Calculate the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startTimestamp = Timestamp.fromDate(startOfMonth);
    
    // Try to get savings from the savingsEvents collection
    let monthlyFromEvents = 0;
    try {
      monthlyFromEvents = await getMonthlySavingsFromEvents(idsToSearch, startTimestamp);
    } catch (error) {
      console.error('Error getting monthly savings from events:', error);
    }
    
    // Try to get savings from the couponRedemptions collection as a fallback
    let monthlyFromRedemptions = 0;
    if (monthlyFromEvents === 0) {
      try {
        monthlyFromRedemptions = await getMonthlySavingsFromRedemptions(idsToSearch, startTimestamp);
      } catch (error) {
        console.error('Error getting monthly savings from redemptions:', error);
      }
    }
    
    // Return the total from both sources (or whichever one worked)
    return monthlyFromEvents + monthlyFromRedemptions;
  } catch (error) {
    console.error('Error calculating monthly saved:', error);
    return 0;
  }
};

/**
 * Get monthly savings from the savingsEvents collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @param startTimestamp Timestamp for the start of the month
 * @returns Amount saved this month
 */
const getMonthlySavingsFromEvents = async (idsToSearch: string[], startTimestamp: Timestamp): Promise<number> => {
  let total = 0;
  
  for (const id of idsToSearch) {
    try {
      // Query by userId and timestamp
      const userEventsQuery = query(
        collection(db, 'savingsEvents'),
        where('userId', '==', id),
        where('timestamp', '>=', startTimestamp)
      );
      
      const userEventsSnapshot = await getDocs(userEventsQuery);
      
      // Sum up all amounts
      userEventsSnapshot.docs.forEach(doc => {
        const amount = doc.data().amount;
        if (typeof amount === 'number') {
          total += amount;
        }
      });
      
      // Query by customerId if it's not the same as userId
      if (id !== idsToSearch[0]) {
        const customerEventsQuery = query(
          collection(db, 'savingsEvents'),
          where('customerId', '==', id),
          where('timestamp', '>=', startTimestamp)
        );
        
        const customerEventsSnapshot = await getDocs(customerEventsQuery);
        
        // Sum up all amounts
        customerEventsSnapshot.docs.forEach(doc => {
          const amount = doc.data().amount;
          if (typeof amount === 'number') {
            total += amount;
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching monthly savings events for ID ${id}:`, error);
      // Continue with other IDs
    }
  }
  
  return total;
};

/**
 * Get monthly savings from the couponRedemptions collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @param startTimestamp Timestamp for the start of the month
 * @returns Amount saved this month
 */
const getMonthlySavingsFromRedemptions = async (idsToSearch: string[], startTimestamp: Timestamp): Promise<number> => {
  let total = 0;
  
  for (const id of idsToSearch) {
    try {
      // Query redemptions by userId and timestamp
      const redemptionsQuery = query(
        collection(db, 'couponRedemptions'),
        where('userId', '==', id),
        where('timestamp', '>=', startTimestamp)
      );
      
      const redemptionsSnapshot = await getDocs(redemptionsQuery);
      
      // For each redemption, get the coupon details to calculate savings
      for (const redemptionDoc of redemptionsSnapshot.docs) {
        try {
          const couponId = redemptionDoc.data().couponId;
          if (couponId) {
            // Try to estimate savings from the coupon value
            // This is a fallback when the exact savings amount isn't recorded
            const couponValue = await estimateCouponValue(couponId);
            total += couponValue;
          }
        } catch (innerError) {
          console.error('Error processing monthly redemption:', innerError);
          // Continue with other redemptions
        }
      }
      
      // If this is a customer ID, also check for redemptions by customerId
      if (id !== idsToSearch[0]) {
        const customerRedemptionsQuery = query(
          collection(db, 'couponRedemptions'),
          where('customerId', '==', id),
          where('timestamp', '>=', startTimestamp)
        );
        
        const customerRedemptionsSnapshot = await getDocs(customerRedemptionsQuery);
        
        for (const redemptionDoc of customerRedemptionsSnapshot.docs) {
          try {
            const couponId = redemptionDoc.data().couponId;
            if (couponId) {
              const couponValue = await estimateCouponValue(couponId);
              total += couponValue;
            }
          } catch (innerError) {
            console.error('Error processing monthly customer redemption:', innerError);
            // Continue with other redemptions
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching monthly redemptions for ID ${id}:`, error);
      // Continue with other IDs
    }
  }
  
  return total;
};

/**
 * Estimate the value of a coupon based on its details
 * @param couponId Coupon ID to estimate value for
 * @returns Estimated value
 */
const estimateCouponValue = async (couponId: string): Promise<number> => {
  try {
    // Try to get the coupon details
    const couponQuery = query(
      collection(db, 'coupons'),
      where('id', '==', couponId)
    );
    
    const couponSnapshot = await getDocs(couponQuery);
    
    if (!couponSnapshot.empty) {
      const couponData = couponSnapshot.docs[0].data();
      
      // Check for a direct value field
      if (typeof couponData.value === 'number') {
        return couponData.value;
      }
      
      // Check for a discount percentage
      if (typeof couponData.discountPercentage === 'number') {
        // Estimate based on average purchase value of $50
        const averagePurchase = 50;
        return (couponData.discountPercentage / 100) * averagePurchase;
      }
      
      // Check for a discount amount
      if (typeof couponData.discountAmount === 'number') {
        return couponData.discountAmount;
      }
      
      // Parse the discount string if it exists
      if (typeof couponData.discount === 'string') {
        // Try to extract a number from the discount string
        const match = couponData.discount.match(/(\d+)/);
        if (match) {
          const value = parseInt(match[0], 10);
          
          // If it contains a % symbol, treat as percentage
          if (couponData.discount.includes('%')) {
            const averagePurchase = 50;
            return (value / 100) * averagePurchase;
          }
          
          // Otherwise treat as direct amount
          return value;
        }
      }
    }
    
    // Default to a conservative estimate if we couldn't determine the value
    return 5;
  } catch (error) {
    console.error('Error estimating coupon value:', error);
    return 5; // Default fallback value
  }
};