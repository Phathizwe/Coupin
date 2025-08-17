/**
 * User Registration Service
 * Handles the creation and setup of new user accounts
 */
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Save a new user record to Firestore
 * 
 * @param userId The user ID from Firebase Auth
 * @param userData User data to save
 * @returns Promise that resolves to true if successful
 */
export const saveNewUserRecord = async (
  userId: string,
  userData: {
    email?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    role?: string;
  }
): Promise<boolean> => {
  try {
    console.log('📝 Saving new user record for:', userId);
    
    if (!userId) {
      console.error('❌ No user ID provided');
      return false;
    }
    
    // Create the user document in Firestore
    const userRef = doc(db, 'users', userId);
    
    // Prepare user data
    const userRecord = {
      uid: userId,
      email: userData.email || null,
      displayName: userData.displayName || null,
      phoneNumber: userData.phoneNumber || null,
      role: userData.role || 'customer', // Default role
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Save to Firestore
    await setDoc(userRef, userRecord);
    console.log('✅ User record saved successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error saving user record:', error);
    return false;
  }
};

/**
 * Update an existing user record
 * 
 * @param userId The user ID
 * @param userData Data to update
 * @returns Promise that resolves to true if successful
 */
export const updateUserRecord = async (
  userId: string,
  userData: Record<string, any>
): Promise<boolean> => {
  try {
    console.log('🔄 Updating user record for:', userId);
    
    if (!userId) {
      console.error('❌ No user ID provided');
      return false;
    }
    
    // Add updatedAt timestamp
    const dataToUpdate = {
      ...userData,
      updatedAt: Timestamp.now()
    };
    
    // Update the user document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, dataToUpdate, { merge: true });
    
    console.log('✅ User record updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating user record:', error);
    return false;
  }
};