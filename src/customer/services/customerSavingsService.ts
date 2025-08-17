import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { calculateSavingsStreak } from './streakCalculator';
import { calculateTotalSaved } from './totalSavingsCalculator';
import { calculateMonthlySaved } from './monthlySavingsCalculator';
import { findCustomerByUserId } from '../../services/customerLinkingService';

/**
 * Default monthly savings goal if none is set
 */
const DEFAULT_MONTHLY_GOAL = 100;

/**
 * Customer savings statistics
 */
export interface SavingsStats {
  totalSaved: number;
  monthlySaved: number;
  currentStreak: number;
  longestStreak: number;
  monthlySavingsGoal: number;
  goalProgress: number;
  savingsStreak: number; // Added to fix the TypeScript error
}

/**
 * Get the monthly savings goal for a user
 * @param userId User ID to get goal for
 * @returns Monthly savings goal amount
 */
export const getMonthlySavingsGoal = async (userId: string): Promise<number> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to getMonthlySavingsGoal');
      return DEFAULT_MONTHLY_GOAL;
    }

    // First check if the user has a linked customer profile
    const customer = await findCustomerByUserId(userId);
    const customerId = customer?.id;
    
    // If we have a customer ID, try to get their savings goal
    if (customerId) {
      try {
        const customerGoalDoc = await getDoc(doc(db, 'customerSavingsGoals', customerId));
        if (customerGoalDoc.exists()) {
          const goalAmount = customerGoalDoc.data().monthlyGoal;
          if (typeof goalAmount === 'number' && goalAmount > 0) {
            return goalAmount;
          }
        }
      } catch (error) {
        console.error('Error getting customer savings goal:', error);
        // Continue to fallback
      }
    }
    
    // If no customer ID or no goal found, try user ID directly
    try {
      const userGoalDoc = await getDoc(doc(db, 'userSavingsGoals', userId));
      if (userGoalDoc.exists()) {
        const goalAmount = userGoalDoc.data().monthlyGoal;
        if (typeof goalAmount === 'number' && goalAmount > 0) {
          return goalAmount;
        }
      }
    } catch (error) {
      console.error('Error getting user savings goal:', error);
      // Return default
    }
    
    return DEFAULT_MONTHLY_GOAL;
  } catch (error) {
    console.error('Error getting monthly savings goal:', error);
    return DEFAULT_MONTHLY_GOAL;
  }
};

/**
 * Set the monthly savings goal for a user
 * @param userId User ID to set goal for
 * @param amount Goal amount
 * @returns Success status
 */
export const setMonthlySavingsGoal = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to setMonthlySavingsGoal');
      return false;
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn('Invalid amount provided to setMonthlySavingsGoal');
      return false;
    }

    // First check if the user has a linked customer profile
    const customer = await findCustomerByUserId(userId);
    const customerId = customer?.id;
    
    // If we have a customer ID, set their savings goal
    if (customerId) {
      try {
        await setDoc(doc(db, 'customerSavingsGoals', customerId), {
          monthlyGoal: amount,
          updatedAt: Timestamp.now(),
          userId: userId
        }, { merge: true });
        return true;
      } catch (error) {
        console.error('Error setting customer savings goal:', error);
        // Try user ID fallback
      }
    }
    
    // If no customer ID or setting failed, try user ID directly
    try {
      await setDoc(doc(db, 'userSavingsGoals', userId), {
        monthlyGoal: amount,
        updatedAt: Timestamp.now()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error setting user savings goal:', error);
      return false;
    }
  } catch (error) {
    console.error('Error setting monthly savings goal:', error);
    return false;
  }
};

/**
 * Get savings statistics for a user
 * @param userId User ID to get stats for
 * @returns Savings statistics
 */
export const getSavingsStats = async (userId: string): Promise<SavingsStats> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to getSavingsStats');
      return createDefaultStats();
    }

    // Get the monthly savings goal
    const monthlySavingsGoal = await getMonthlySavingsGoal(userId);
    
    // Calculate the savings streak
    const { currentStreak, longestStreak } = await calculateSavingsStreak(userId)
      .catch(error => {
        console.error('Error calculating savings streak:', error);
        return { currentStreak: 0, longestStreak: 0 };
      });
    
    // Calculate total saved
    const totalSaved = await calculateTotalSaved(userId)
      .catch(error => {
        console.error('Error calculating total saved:', error);
        return 0;
      });
    
    // Calculate monthly saved
    const monthlySaved = await calculateMonthlySaved(userId)
      .catch(error => {
        console.error('Error calculating monthly saved:', error);
        return 0;
      });
    
    // Calculate goal progress
    const goalProgress = monthlySavingsGoal > 0 
      ? Math.min(100, (monthlySaved / monthlySavingsGoal) * 100) 
      : 0;
    
    return {
      totalSaved,
      monthlySaved,
      currentStreak,
      longestStreak,
      monthlySavingsGoal,
      goalProgress,
      savingsStreak: currentStreak // Added to fix the TypeScript error
    };
  } catch (error) {
    console.error('Error getting savings stats:', error);
    return createDefaultStats();
  }
};

/**
 * Record a savings event for a user
 * @param userId User ID
 * @param couponId Coupon ID
 * @param amount Amount saved
 * @param businessId Business ID
 * @returns Success status
 */
export const recordSavingsEvent = async (
  userId: string,
  couponId: string,
  amount: number,
  businessId?: string
): Promise<boolean> => {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid user ID provided to recordSavingsEvent');
      return false;
    }
    
    if (!couponId || typeof couponId !== 'string' || couponId.trim() === '') {
      console.warn('Invalid coupon ID provided to recordSavingsEvent');
      return false;
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn('Invalid amount provided to recordSavingsEvent');
      return false;
    }

    // First check if the user has a linked customer profile
    const customer = await findCustomerByUserId(userId);
    const customerId = customer?.id;
    
    const savingsEvent = {
      userId,
      customerId,
      couponId,
      amount,
      businessId,
      timestamp: Timestamp.now(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    
    // Create a unique ID for the savings event
    const eventId = `${userId}_${couponId}_${Date.now()}`;
    
    try {
      await setDoc(doc(db, 'savingsEvents', eventId), savingsEvent);
      return true;
    } catch (error) {
      console.error('Error recording savings event:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in recordSavingsEvent:', error);
    return false;
  }
};

/**
 * Create default savings stats
 * @returns Default savings stats
 */
const createDefaultStats = (): SavingsStats => {
  return {
    totalSaved: 0,
    monthlySaved: 0,
    currentStreak: 0,
    longestStreak: 0,
    monthlySavingsGoal: DEFAULT_MONTHLY_GOAL,
    goalProgress: 0,
    savingsStreak: 0 // Added to fix the TypeScript error
  };
};