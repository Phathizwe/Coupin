import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { findCustomerByUserId } from '../../../services/customerLinkingService';
import { getSearchIds } from './savingsHelpers';

/**
 * Calculates the savings streak based on coupon redemptions
 * @param userId User ID to calculate streak for
 * @returns Number of consecutive days with redemptions
 */
export const calculateSavingsStreak = async (userId: string): Promise<number> => {
  try {
    // Get IDs to search (user ID and possibly customer ID)
    const idsToSearch = await getSearchIds(userId);
    
    // Get all redemption dates from couponDistributions
    const redemptionDates: Date[] = [];
    
    for (const id of idsToSearch) {
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        where('customerId', '==', id),
        where('status', '==', 'redeemed'),
        orderBy('redeemedAt', 'desc')
      );
      
      const snapshot = await getDocs(distributionsQuery);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.redeemedAt) {
          const date = data.redeemedAt instanceof Timestamp 
            ? data.redeemedAt.toDate() 
            : new Date(data.redeemedAt);
          
          // Format as YYYY-MM-DD to ignore time
          const dateString = date.toISOString().split('T')[0];
          redemptionDates.push(new Date(dateString));
        }
      });
    }
    
    // If no redemptions, return 0
    if (redemptionDates.length === 0) {
      return 0;
    }
    
    // Sort dates in descending order (newest first)
    redemptionDates.sort((a, b) => b.getTime() - a.getTime());
    
    // Remove duplicate dates (only count one redemption per day)
    const uniqueDates = redemptionDates.filter((date, index, self) => 
      index === self.findIndex(d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0])
    );
    
    // Calculate streak
    let streak = 1; // Start with 1 for the most recent day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mostRecentDate = uniqueDates[0];
    
    // If most recent redemption is not today or yesterday, no current streak
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) {
      return 0;
    }
    
    // Check consecutive days
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      
      // Calculate days between consecutive redemptions
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If exactly 1 day difference, continue streak
      if (diffDays === 1) {
        streak++;
      } else {
        // Break the streak if gap is more than 1 day
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating savings streak:', error);
    return 0;
  }
};