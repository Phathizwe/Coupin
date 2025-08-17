import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { findCustomerByUserId } from '../../services/customerLinkingService';

/**
 * Calculate the total amount saved by a user across all time
 * @param userId User ID to calculate total for
 * @returns Total amount saved
 */
export const calculateTotalSaved = async (userId: string): Promise<number> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to calculateTotalSaved');
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
      console.warn('Error finding linked customer in total savings calculator:', error);
      // Continue with just the user ID
    }
    
    // Try to get savings from the savingsEvents collection
    let totalFromEvents = 0;
    try {
      totalFromEvents = await getSavingsFromEvents(idsToSearch);
    } catch (error) {
      console.error('Error getting savings from events:', error);
    }
    
    // Try to get savings from the couponRedemptions collection as a fallback
    let totalFromRedemptions = 0;
    if (totalFromEvents === 0) {
      try {
        totalFromRedemptions = await getSavingsFromRedemptions(idsToSearch);
      } catch (error) {
        console.error('Error getting savings from redemptions:', error);
      }
    }
    
    // Return the total from both sources (or whichever one worked)
    return totalFromEvents + totalFromRedemptions;
  } catch (error) {
    console.error('Error calculating total saved:', error);
    return 0;
  }
};

/**
 * Get total savings from the savingsEvents collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @returns Total amount saved
 */
const getSavingsFromEvents = async (idsToSearch: string[]): Promise<number> => {
  let total = 0;
  
  for (const id of idsToSearch) {
    try {
      // Query by userId
      const userEventsQuery = query(
        collection(db, 'savingsEvents'),
        where('userId', '==', id)
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
          where('customerId', '==', id)
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
      console.error(`Error fetching savings events for ID ${id}:`, error);
      // Continue with other IDs
    }
  }
  
  return total;
};

/**
 * Get total savings from the couponRedemptions collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @returns Total amount saved
 */
const getSavingsFromRedemptions = async (idsToSearch: string[]): Promise<number> => {
  let total = 0;
  
  for (const id of idsToSearch) {
    try {
      // Query redemptions by userId
      const redemptionsQuery = query(
        collection(db, 'couponRedemptions'),
        where('userId', '==', id)
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
          console.error('Error processing redemption:', innerError);
          // Continue with other redemptions
        }
      }
      
      // If this is a customer ID, also check for redemptions by customerId
      if (id !== idsToSearch[0]) {
        const customerRedemptionsQuery = query(
          collection(db, 'couponRedemptions'),
          where('customerId', '==', id)
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
            console.error('Error processing customer redemption:', innerError);
            // Continue with other redemptions
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching redemptions for ID ${id}:`, error);
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