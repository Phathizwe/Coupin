import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { findCustomerByUserId } from '../../services/customerLinkingService';

/**
 * Streak calculation result
 */
interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate the current and longest savings streak for a user
 * @param userId User ID to calculate streak for
 * @returns Current and longest streak
 */
export const calculateSavingsStreak = async (userId: string): Promise<StreakResult> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to calculateSavingsStreak');
      return { currentStreak: 0, longestStreak: 0 };
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
      console.warn('Error finding linked customer in streak calculator:', error);
      // Continue with just the user ID
    }
    
    // Get all savings events for this user
    const events = await getSavingsEvents(idsToSearch);
    
    if (events.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(events);
    
    return { currentStreak, longestStreak };
  } catch (error) {
    console.error('Error calculating savings streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Get all savings events for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @returns Array of event dates
 */
const getSavingsEvents = async (idsToSearch: string[]): Promise<string[]> => {
  const allDates: string[] = [];
  
  // Try to get events from the savingsEvents collection
  try {
    for (const id of idsToSearch) {
      try {
        // Query by userId
        const userEventsQuery = query(
          collection(db, 'savingsEvents'),
          where('userId', '==', id),
          orderBy('timestamp', 'desc')
        );
        
        const userEventsSnapshot = await getDocs(userEventsQuery);
        const userEventDates = userEventsSnapshot.docs
          .map(doc => doc.data().date as string)
          .filter(Boolean);
          
        allDates.push(...userEventDates);
        
        // Query by customerId if it's not the same as userId
        if (id !== idsToSearch[0]) {
          const customerEventsQuery = query(
            collection(db, 'savingsEvents'),
            where('customerId', '==', id),
            orderBy('timestamp', 'desc')
          );
          
          const customerEventsSnapshot = await getDocs(customerEventsQuery);
          const customerEventDates = customerEventsSnapshot.docs
            .map(doc => doc.data().date as string)
            .filter(Boolean);
            
          allDates.push(...customerEventDates);
        }
      } catch (error) {
        console.error(`Error fetching savings events for ID ${id}:`, error);
        // Continue with other IDs
      }
    }
  } catch (error) {
    console.error('Error in getSavingsEvents:', error);
  }
  
  // Try to get events from the couponRedemptions collection as a fallback
  if (allDates.length === 0) {
    try {
      for (const id of idsToSearch) {
        try {
          const redemptionsQuery = query(
            collection(db, 'couponRedemptions'),
            where('userId', '==', id),
            orderBy('timestamp', 'desc')
          );
          
          const redemptionsSnapshot = await getDocs(redemptionsQuery);
          const redemptionDates = redemptionsSnapshot.docs
            .map(doc => {
              const timestamp = doc.data().timestamp;
              if (timestamp) {
                const date = timestamp instanceof Timestamp 
                  ? timestamp.toDate() 
                  : new Date(timestamp);
                return date.toISOString().split('T')[0]; // YYYY-MM-DD format
              }
              return null;
            })
            .filter(Boolean) as string[];
            
          allDates.push(...redemptionDates);
        } catch (error) {
          console.error(`Error fetching redemptions for ID ${id}:`, error);
          // Continue with other IDs
        }
      }
    } catch (error) {
      console.error('Error getting redemption events:', error);
    }
  }
  
  // Remove duplicates - using Array.filter instead of Set to avoid TS2802 error
  return allDates.filter((date, index, self) => 
    self.indexOf(date) === index
  );
};

/**
 * Calculate current and longest streaks from a list of event dates
 * @param dates Array of event dates in YYYY-MM-DD format
 * @returns Current and longest streak
 */
const calculateStreaks = (dates: string[]): StreakResult => {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Sort dates in descending order (newest first)
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  
  // Remove duplicates (in case multiple events happened on the same day)
  // Using Array.filter instead of Set to avoid TS2802 error
  const uniqueDates = sortedDates.filter((date, index, self) => 
    self.indexOf(date) === index
  );
  
  // Calculate current streak
  let currentStreak = 1; // Start with 1 for the most recent day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If most recent event is not today or yesterday, current streak is 0
  const daysSinceLastEvent = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceLastEvent > 1) {
    currentStreak = 0;
  } else {
    // Check for consecutive days
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      
      // Calculate days between these dates
      const daysBetween = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween === 1) {
        // Consecutive day, increment streak
        currentStreak++;
      } else {
        // Break in streak
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    
    // Calculate days between these dates
    const daysBetween = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysBetween === 1) {
      // Consecutive day, increment temp streak
      tempStreak++;
    } else {
      // Break in streak, check if this was the longest
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  // Check final temp streak
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
};