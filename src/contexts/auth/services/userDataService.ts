/**
 * User data service
 * Handles user data retrieval and processing
 */
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../../../config/firebase';
import { ExtendedUser } from '../types';

/**
 * Debug user data for troubleshooting
 * 
 * @param userId User ID to debug
 */
export const debugUserData = async (userId: string): Promise<void> => {
  try {
    console.log('🔍 [USER DATA] Debugging user data for:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    console.log('🔍 [USER DATA] User document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      console.log('🔍 [USER DATA] User data:', userDoc.data());

      // Check if businessId exists
      const businessId = userDoc.data().businessId || userDoc.data().currentBusinessId;
      console.log('🔍 [USER DATA] Business ID from user document:', businessId);

      if (businessId) {
        // Check if business document exists
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        console.log('🔍 [USER DATA] Business document exists:', businessDoc.exists());
        if (businessDoc.exists()) {
          console.log('🔍 [USER DATA] Business data:', businessDoc.data());
        }
      }
      
      // Check if phoneNumber exists
      const phoneNumber = userDoc.data().phoneNumber;
      console.log('🔍 [USER DATA] Phone number from user document:', phoneNumber);
    }
  } catch (error) {
    console.error('❌ [USER DATA] Error debugging user data:', error);
  }
};

/**
 * Handle user data processing
 * 
 * @param firebaseUser Firebase user object
 * @returns Extended user object with additional data
 */
export const handleUserData = async (firebaseUser: FirebaseUser): Promise<ExtendedUser | null> => {
  if (!firebaseUser) {
    console.error('❌ [USER DATA] No Firebase user provided');
    return null;
  }

  try {
    console.log('🔍 [USER DATA] Processing user data for:', firebaseUser.uid);
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    console.log('🔍 [USER DATA] Getting user document from Firestore...');
    const userDoc = await getDoc(userDocRef);
    console.log('🔍 [USER DATA] User document exists:', userDoc.exists());

    // Debug the user data
    await debugUserData(firebaseUser.uid);

    // Create a base extended user object with proper type handling
    console.log('🔍 [USER DATA] Creating extended user object...');
    const extendedUser: ExtendedUser = {
      ...firebaseUser,
      role: 'customer', // Default role
      businesses: [],
      businessId: undefined,
      currentBusinessId: undefined,
      businessProfile: undefined
    };
    
    if (userDoc.exists()) {
      console.log('✅ [USER DATA] User document exists in Firestore');
      const docData = userDoc.data();

      // Add Firestore data to the extended user
      extendedUser.role = docData.role || 'customer';
      extendedUser.businessId = docData.businessId || undefined;
      extendedUser.businesses = docData.businesses || [];
      extendedUser.currentBusinessId = docData.currentBusinessId || docData.businessId || undefined;
      
      // Add phone number if it exists
      if (docData.phoneNumber) {
        extendedUser.phoneNumber = docData.phoneNumber;
        console.log('✅ [USER DATA] Phone number found in user document:', extendedUser.phoneNumber);
      } else {
        console.log('⚠️ [USER DATA] No phone number found in user document');
      }

      // Handle business user specific data
      if (extendedUser.role === 'business') {
        await handleBusinessUserData(extendedUser, userDocRef, docData);
      }
    } else {
      // User document doesn't exist, create one
      console.log('⚠️ [USER DATA] User document does not exist, creating one...');
      await createDefaultUserDocument(firebaseUser, userDocRef, extendedUser);
    }

    // If we have a businessId, fetch the business profile
    if (extendedUser.businessId) {
      await fetchBusinessProfile(extendedUser);
    }

    console.log('✅ [USER DATA] Successfully processed user data:', extendedUser.uid);
    
    // Final validation before returning
    if (!extendedUser.uid) {
      console.error('❌ [USER DATA] CRITICAL: Extended user missing UID!');
      return null;
    }

    return extendedUser;
  } catch (error) {
    console.error('❌ [USER DATA] Error processing user data:', error);
    console.error('❌ [USER DATA] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
};

/**
 * Handle business user specific data
 * 
 * @param extendedUser Extended user object to update
 * @param userDocRef Reference to user document
 * @param docData User document data
 */
const handleBusinessUserData = async (
  extendedUser: ExtendedUser, 
  userDocRef: any, 
  docData: any
): Promise<void> => {
  // If no businessId but we have businesses array
  if (!extendedUser.businessId && extendedUser.businesses && extendedUser.businesses.length > 0) {
    extendedUser.businessId = extendedUser.businesses[0];
    extendedUser.currentBusinessId = extendedUser.businesses[0];

    // Update the user document with the businessId
    await updateDoc(userDocRef, {
      businessId: extendedUser.businessId,
      currentBusinessId: extendedUser.currentBusinessId,
      updatedAt: serverTimestamp()
    });

    console.log('✅ [USER DATA] Updated user with businessId:', extendedUser.businessId);
  }
  // If no businesses array but we have a businessId
  else if (extendedUser.businessId && (!extendedUser.businesses || extendedUser.businesses.length === 0)) {
    extendedUser.businesses = [extendedUser.businessId];

    // Update the user document with the businesses array
    await updateDoc(userDocRef, {
      businesses: extendedUser.businesses,
      updatedAt: serverTimestamp()
    });

    console.log('✅ [USER DATA] Updated user with businesses array:', extendedUser.businesses);
  }
};

/**
 * Create default user document when it doesn't exist
 * 
 * @param firebaseUser Firebase user object
 * @param userDocRef Reference to user document
 * @param extendedUser Extended user object to update
 */
const createDefaultUserDocument = async (
  firebaseUser: FirebaseUser,
  userDocRef: any,
  extendedUser: ExtendedUser
): Promise<void> => {
  // Default to customer role if not specified
  const role = 'customer';

  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Save user data to Firestore
  await setDoc(userDocRef, userData);
  console.log('✅ [USER DATA] Created user document:', userData);

  // Update extended user with the role
  extendedUser.role = role;
};

/**
 * Fetch business profile for business users
 * 
 * @param extendedUser Extended user object to update with business profile
 */
const fetchBusinessProfile = async (extendedUser: ExtendedUser): Promise<void> => {
  const businessDocRef = doc(db, 'businesses', extendedUser.businessId!);
  const businessDoc = await getDoc(businessDocRef);

  if (businessDoc.exists()) {
    const businessData = businessDoc.data();
    extendedUser.businessProfile = {
      businessId: extendedUser.businessId!,
      businessName: businessData.businessName || '',
      industry: businessData.industry || '',
      address: businessData.address || '',
      phone: businessData.phone || '',
      website: businessData.website || '',
      logo: businessData.logo || '',
      colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' },
      subscriptionTier: businessData.subscriptionTier || 'free',
      subscriptionStatus: businessData.subscriptionStatus || 'active'
    };

    console.log('✅ [USER DATA] Loaded business profile:', extendedUser.businessProfile);
  } else {
    console.error('⚠️ [USER DATA] Business document does not exist for ID:', extendedUser.businessId);
  }
};