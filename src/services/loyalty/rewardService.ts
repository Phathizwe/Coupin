import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyReward } from '../../types';

// Get loyalty rewards for a program
export const getLoyaltyRewards = async (programId: string) => {
  try {
    const rewardsQuery = query(
      collection(db, 'loyaltyRewards'),
      where('programId', '==', programId),
      orderBy('pointsCost')
    );

    const snapshot = await getDocs(rewardsQuery);
    const rewards: LoyaltyReward[] = [];

    snapshot.forEach(doc => {
      rewards.push({
        ...doc.data(),
        id: doc.id
      } as LoyaltyReward);
    });

    return rewards;
  } catch (error) {
    console.error('Error getting loyalty rewards:', error);
    throw error;
  }
};

// Add a loyalty reward
export const addLoyaltyReward = async (reward: Omit<LoyaltyReward, 'id'>) => {
  try {
    const newRewardRef = doc(collection(db, 'loyaltyRewards'));
    await setDoc(newRewardRef, reward);

    return {
      ...reward,
      id: newRewardRef.id
    };
  } catch (error) {
    console.error('Error adding loyalty reward:', error);
    throw error;
  }
};

// Update a loyalty reward
export const updateLoyaltyReward = async (rewardId: string, updates: Partial<LoyaltyReward>) => {
  try {
    const rewardRef = doc(db, 'loyaltyRewards', rewardId);

    // Remove id from updates if it exists
    const { id, ...updateData } = updates;

    await updateDoc(rewardRef, updateData);

    return true;
  } catch (error) {
    console.error('Error updating loyalty reward:', error);
    throw error;
  }
};

// Delete a loyalty reward
export const deleteLoyaltyReward = async (rewardId: string) => {
  try {
    const rewardRef = doc(db, 'loyaltyRewards', rewardId);
    await deleteDoc(rewardRef);

    return true;
  } catch (error) {
    console.error('Error deleting loyalty reward:', error);
    throw error;
  }
};