import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyAchievement } from '../../types';
import { LoyaltyProgramStats } from './statsService';
import { FEATURE_FLAGS } from '../../config/featureFlags';

// Helper function to get the correct businessId
const getCorrectBusinessId = (businessId: string): string => {
  // Handle the hardcoded "business_id" case - this should never be used
  if (businessId === 'business_id') {
    console.error('🚨 CRITICAL: Attempted to use hardcoded "business_id"!');
    throw new Error('Invalid businessId: Cannot use hardcoded "business_id"');
  }

  // Handle the known businessId mismatch
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
  }

  // Add your specific business ID mapping if needed
  if (businessId === 'FDO1T2TrcWcglFBm4w68') {
    console.log('✅ Using the correct business ID for FDO1T2TrcWcglFBm4w68');
    // If there's a known mismatch, you would return the correct ID here
  return businessId;
  }

  return businessId;
};

// Default achievements for new programs
const DEFAULT_ACHIEVEMENTS = [
  {
    title: 'Program Launch',
    description: 'Successfully launched your loyalty program',
    icon: '🚀',
    completed: true,
    completedAt: new Date()
  },
  {
    title: 'First 10 Members',
    description: 'Your program reached 10 members',
    icon: '👥',
    completed: false,
    completedAt: null
  },
  {
    title: 'First Redemption',
    description: 'A customer redeemed their first reward',
    icon: '🎁',
    completed: false,
    completedAt: null
  },
  {
    title: 'Loyalty Champion',
    description: 'Your program reached 50 members',
    icon: '🏆',
    completed: false,
    completedAt: null
  }
];

// Verify that the program exists before creating achievements
const verifyProgramExists = async (programId: string): Promise<boolean> => {
  try {
    if (!programId) return false;
    
    const programRef = doc(db, 'loyaltyPrograms', programId);
    const programDoc = await getDoc(programRef);
    
    return programDoc.exists();
  } catch (error) {
    console.error('Error verifying program existence:', error);
      return false;
    }
};

export const getLoyaltyAchievements = async (businessId: string, programId: string): Promise<LoyaltyAchievement[]> => {
  try {
    // If achievements are disabled, return an empty array
    if (!FEATURE_FLAGS.LOYALTY_ACHIEVEMENTS_ENABLED) {
      console.log('Loyalty achievements are disabled via feature flag');
      return [];
    }

    if (!businessId || !programId) {
      console.error('Missing businessId or programId in getLoyaltyAchievements');
      return [];
    }

    const correctedBusinessId = getCorrectBusinessId(businessId);
    console.log(`Getting achievements for business ${correctedBusinessId} and program ${programId}`);

    // Query existing achievements
    const achievementsQuery = query(
      collection(db, 'loyaltyAchievements'),
      where('businessId', '==', correctedBusinessId),
      where('programId', '==', programId)
    );
    const snapshot = await getDocs(achievementsQuery);

    if (snapshot.empty) {
      console.log('No existing achievements found, checking if program exists...');
      
      // IMPORTANT: Verify the program exists before creating achievements
      const programExists = await verifyProgramExists(programId);
      
      if (!programExists) {
        console.error(`Cannot create achievements for non-existent program: ${programId}`);
        return [];
      }
      
      console.log('Program exists, creating default achievements');
      // Create default achievements for new programs
      const achievements: LoyaltyAchievement[] = [];

      for (const defaultAchievement of DEFAULT_ACHIEVEMENTS) {
        const achievementRef = doc(collection(db, 'loyaltyAchievements'));
        const achievementData = {
          ...defaultAchievement,
          businessId: correctedBusinessId,
          programId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
};

        await setDoc(achievementRef, achievementData);
        console.log(`Created achievement: ${defaultAchievement.title} with ID: ${achievementRef.id}`);

        achievements.push({
          ...defaultAchievement,
          id: achievementRef.id,
          businessId: correctedBusinessId,
          programId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as LoyaltyAchievement);
      }

      return achievements;
    }

    console.log(`Found ${snapshot.docs.length} existing achievements`);

    // Convert existing achievements
    const achievements = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : data.completedAt
      } as LoyaltyAchievement;
    });

    return achievements;
  } catch (error) {
    console.error('Error getting loyalty achievements:', error);
    throw error;
  }
};

/**
 * Updates the status of a specific achievement
 */
export const updateAchievementStatus = async (
  achievementId: string,
  completed: boolean,
  completedAt: Date | null = null
): Promise<void> => {
  try {
    if (!achievementId) {
      console.error('Missing achievementId in updateAchievementStatus');
      return;
    }

    const achievementRef = doc(db, 'loyaltyAchievements', achievementId);
    const achievementDoc = await getDoc(achievementRef);

    if (!achievementDoc.exists()) {
      console.error(`Achievement with ID ${achievementId} not found`);
      return;
    }

    await updateDoc(achievementRef, {
      completed,
      completedAt: completed ? completedAt || new Date() : null,
      updatedAt: serverTimestamp()
    });

    console.log(`Updated achievement ${achievementId} status to ${completed ? 'completed' : 'incomplete'}`);
  } catch (error) {
    console.error('Error updating achievement status:', error);
    throw error;
  }
};

/**
 * Checks and updates achievements based on program stats
 */
export const checkAndUpdateAchievements = async (
  businessId: string,
  programId: string,
  stats: LoyaltyProgramStats
): Promise<void> => {
  try {
    if (!FEATURE_FLAGS.LOYALTY_ACHIEVEMENTS_ENABLED) {
      console.log('Loyalty achievements are disabled via feature flag');
      return;
    }

    if (!businessId || !programId) {
      console.error('Missing businessId or programId in checkAndUpdateAchievements');
      return;
    }

    console.log(`Checking achievements for program ${programId} with stats:`, stats);
    
    // Get all achievements for this program
    const achievements = await getLoyaltyAchievements(businessId, programId);
    
    // Check each achievement and update if needed
    for (const achievement of achievements) {
      // Skip already completed achievements
      if (achievement.completed) continue;
      
      let shouldComplete = false;
      
      // Check achievement conditions based on title
      switch (achievement.title) {
        case 'First 10 Members':
          shouldComplete = stats.memberCount >= 10;
          break;
        case 'First Redemption':
          shouldComplete = stats.redemptionRate > 0;
          break;
        case 'Loyalty Champion':
          shouldComplete = stats.memberCount >= 50;
          break;
        // Add more cases as needed
      }
      
      // Update the achievement if conditions are met
      if (shouldComplete) {
        console.log(`Achievement "${achievement.title}" conditions met, updating status`);
        await updateAchievementStatus(achievement.id, true);
      }
    }
    
    console.log('Finished checking and updating achievements');
  } catch (error) {
    console.error('Error checking and updating achievements:', error);
    // Don't throw the error to prevent breaking the main flow
  }
};
