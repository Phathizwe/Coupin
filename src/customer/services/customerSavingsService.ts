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
import { calculateSavingsStreak } from './savingsCalculations/streakCalculator';
import { calculateTotalSaved } from './savingsCalculations/totalSavingsCalculator';
import { calculateMonthlySaved } from './savingsCalculations/monthlySavingsCalculator';

interface SavingsStats {
  savingsStreak: number;
  totalSaved: number;
  monthlySaved: number;
  monthlySavingsGoal: number;
}

/**
 * Gets the monthly savings goal from user settings or returns default
 * @param userId User ID to get goal for
 * @returns Monthly savings goal amount
 */
const getMonthlySavingsGoal = async (userId: string): Promise<number> => {
  try {
    // Check if user has a custom savings goal set
    const userSettingsRef = collection(db, 'userSettings');
    const userSettingsQuery = query(
      userSettingsRef,
      where('userId', '==', userId),
      limit(1)
    );
    
    const snapshot = await getDocs(userSettingsQuery);
    
    if (!snapshot.empty) {
      const userSettings = snapshot.docs[0].data();
      if (userSettings.monthlySavingsGoal) {
        return Number(userSettings.monthlySavingsGoal);
      }
    }
    
    // Default goal if not set
    return 500;
  } catch (error) {
    console.error('Error getting monthly savings goal:', error);
    return 500; // Default to R500
  }
};

/**
 * Gets all savings statistics for a user
 * @param userId User ID to get statistics for
 * @returns Object containing all savings statistics
 */
export const getSavingsStats = async (userId: string): Promise<SavingsStats> => {
  if (!userId) {
    return {
      savingsStreak: 0,
      totalSaved: 0,
      monthlySaved: 0,
      monthlySavingsGoal: 500
    };
  }
  
  try {
    // Fetch all stats in parallel for better performance
    const [
      savingsStreak,
      totalSaved,
      monthlySaved,
      monthlySavingsGoal
    ] = await Promise.all([
      calculateSavingsStreak(userId),
      calculateTotalSaved(userId),
      calculateMonthlySaved(userId),
      getMonthlySavingsGoal(userId)
    ]);
    
    return {
      savingsStreak,
      totalSaved,
      monthlySaved,
      monthlySavingsGoal
    };
  } catch (error) {
    console.error('Error getting savings stats:', error);
    return {
      savingsStreak: 0,
      totalSaved: 0,
      monthlySaved: 0,
      monthlySavingsGoal: 500
    };
  }
};