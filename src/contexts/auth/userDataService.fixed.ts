import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User document found:', userData);
      
      // Get list of businesses this user belongs to
      const businesses = userData.businesses || [];
      let currentBusinessId = userData.currentBusinessId;
      
      // If no current business is set but user has businesses, use the first one
      if (!currentBusinessId && businesses.length > 0) {
        currentBusinessId = businesses[0];
        // Update user's current business in Firestore
        try {
          await updateDoc(userDocRef, {
            currentBusinessId,
            updatedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.error('Error updating current business ID, continuing anyway:', updateError);
        }
      }
      
      // Create extended user with business info
      const extendedUser = {
        ...firebaseUser,
        businessId: currentBusinessId,
        businesses: businesses,
        role: userData.role || 'business', // Default to business if role is missing
        currentBusinessId: currentBusinessId
      } as ExtendedUser;
      
      console.log('Created extended user:', extendedUser);
      return { 
        extendedUser,
        businessIds: businesses,
        currentBusinessId
      };
    } else {
      console.log('No user document found, creating a basic one');
      
      // Create a basic user document if it doesn't exist
      const basicUserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'business', // Default to business role
        businesses: [firebaseUser.uid], // Default to using UID as business ID
        currentBusinessId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      try {
        await setDoc(userDocRef, basicUserData);
        console.log('Created basic user document');
      } catch (createError) {
        console.error('Error creating user document, continuing anyway:', createError);
      }
      
      const extendedUser = {
        ...firebaseUser,
        businessId: firebaseUser.uid,
        businesses: [firebaseUser.uid],
        role: 'business',
        currentBusinessId: firebaseUser.uid
      } as ExtendedUser;
      
      return { 
        extendedUser,
        businessIds: [firebaseUser.uid],
        currentBusinessId: firebaseUser.uid
      };
    }
  } catch (error) {
    console.error('Error loading user data, using basic user:', error);
    
    // Return a basic extended user as fallback
    const fallbackUser = {
      ...firebaseUser,
      businessId: firebaseUser.uid,
      businesses: [firebaseUser.uid],
      role: 'business',
      currentBusinessId: firebaseUser.uid
    } as ExtendedUser;
    
    return { 
      extendedUser: fallbackUser,
      businessIds: [firebaseUser.uid],
      currentBusinessId: firebaseUser.uid
    };
  }
};