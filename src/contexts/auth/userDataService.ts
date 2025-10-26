import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ExtendedUser } from './types';

// Load user data including all associated businesses
export const loadUserData = async (
  firebaseUser: FirebaseUser
): Promise<{
  extendedUser: ExtendedUser,
  businessIds: string[],
  currentBusinessId?: string
}> => {
  console.log('Loading user data for:', firebaseUser.uid);
  try {
    // Get user document by UID
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User document found:', userData);

      // Get list of businesses this user belongs to - ensure it's an array
      const businesses = Array.isArray(userData.businesses) ? userData.businesses : [];
      let currentBusinessId = userData.currentBusinessId;

      // Filter out any invalid business IDs
      const validBusinesses = businesses.filter(id => id && typeof id === 'string' && id.trim() !== '');

      // If no current business is set but user has valid businesses, use the first one
      if (!currentBusinessId && validBusinesses.length > 0) {
        currentBusinessId = validBusinesses[0];
        // Update user's current business in Firestore
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            currentBusinessId,
            businesses: validBusinesses, // Also clean up the businesses array
            updatedAt: serverTimestamp()
          });
          console.log('Updated user with currentBusinessId:', currentBusinessId);
        } catch (updateError) {
          console.error('Error updating user currentBusinessId:', updateError);
        }
      }

      // Create extended user with business info
      const extendedUser = {
        ...firebaseUser,
        businessId: currentBusinessId || undefined, // Don't set empty strings
        businesses: validBusinesses,
        role: userData.role || 'customer', // Default to customer if no role is set
        currentBusinessId: currentBusinessId || undefined,
        phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber, // Include phone number from Firestore
        displayName: userData.displayName || firebaseUser.displayName   // Include display name from Firestore
      } as ExtendedUser;

      console.log('Created extended user:', {
        uid: extendedUser.uid,
        email: extendedUser.email,
        role: extendedUser.role,
        businessId: extendedUser.businessId,
        businessCount: validBusinesses.length
      });

      return {
        extendedUser,
        businessIds: validBusinesses,
        currentBusinessId
      };
    } else {
      console.log('No user document found, creating basic customer user');

      // Create a basic customer user if no document exists
      const basicUser = {
        ...firebaseUser,
        role: 'customer',
        businesses: [],
        businessId: undefined,
        currentBusinessId: undefined
      } as ExtendedUser;

      return {
        extendedUser: basicUser,
        businessIds: []
      };
    }
  } catch (error) {
    console.error('Error loading user data:', error);

    // Return a safe fallback user
    const fallbackUser = {
      ...firebaseUser,
      role: 'customer',
      businesses: [],
      businessId: undefined,
      currentBusinessId: undefined
    } as ExtendedUser;

    return {
      extendedUser: fallbackUser,
      businessIds: []
    };
  }
};