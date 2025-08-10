import { useCallback } from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  browserPopupRedirectResolver,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../../../config/firebase';
import { ExtendedUser } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BusinessProfile } from '../../../types';

/**
 * Custom hook for social authentication methods
 * Extracts social auth logic from the main context
 */

export const useSocialAuth = (contextHandleUserData: (user: any) => Promise<ExtendedUser | null>) => {
  const googleSignIn = useCallback(async (): Promise<ExtendedUser> => {
    console.log('[SocialAuth] ===== GOOGLE SIGN-IN FUNCTION CALLED =====');
    console.log('[SocialAuth] Function start timestamp:', new Date().toISOString());

    try {
      console.log('[SocialAuth] Starting Google sign-in');
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');

      // Use the explicit resolver to avoid popup blockers
      console.log('[SocialAuth] Attempting signInWithPopup...');
      const userCredential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);

      console.log('[SocialAuth] Google sign-in successful, user:', userCredential.user.uid);
      console.log('[SocialAuth] Full userCredential:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified
      });

      // Ensure we have a user before proceeding
      if (!userCredential.user) {
        throw new Error('No user returned from Google authentication');
      }

      // Validate the Firebase user object
      console.log('[SocialAuth] Validating Firebase user object...');
      if (!userCredential.user.uid) {
        throw new Error('Firebase user missing UID');
      }
      if (!userCredential.user.email) {
        console.warn('[SocialAuth] Firebase user missing email');
      }
      console.log('[SocialAuth] Firebase user validation passed');

      // Check if user document exists in Firestore
      console.log('[SocialAuth] Checking if user document exists...');
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      console.log('[SocialAuth] User document exists:', userDoc.exists());

      // If user document doesn't exist, create it
      if (!userDoc.exists()) {
        console.log('[SocialAuth] Creating new user document for Google user');
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          role: 'customer', // Default role for Google sign-in
          businesses: [],
          createdAt: new Date()
        });
        console.log('[SocialAuth] User document created successfully');
      } else {
        console.log('[SocialAuth] User document already exists');
      }

      // Instead of using handleUserDataService, let's process the user data directly here
      console.log('[SocialAuth] Processing user data directly...');

      // Create the extended user object with proper defaults
      const extendedUser: ExtendedUser = {
        ...userCredential.user,
        role: 'customer', // Default role for Google sign-in
        businesses: [],
        businessId: undefined,
        currentBusinessId: undefined,
        businessProfile: undefined
      };

      // If user document exists, get the data from it
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('[SocialAuth] User document data:', userData);

        extendedUser.role = userData.role || 'customer';
        extendedUser.businesses = userData.businesses || [];
        extendedUser.businessId = userData.businessId || undefined;
        extendedUser.currentBusinessId = userData.currentBusinessId || userData.businessId || undefined;
      }

      console.log('[SocialAuth] Extended user created:', {
        uid: extendedUser.uid,
        email: extendedUser.email,
        role: extendedUser.role,
        businessId: extendedUser.businessId
      });

      // Update the context with the processed user
      console.log('[SocialAuth] Updating context with processed user');
      try {
        await contextHandleUserData(extendedUser);
        console.log('[SocialAuth] Context updated successfully');
      } catch (contextError) {
        console.error('[SocialAuth] Error updating context with processed user:', contextError);
        // Continue anyway, as the extended user is still valid
      }

      console.log('[SocialAuth] Successfully processed Google user:', extendedUser.uid);
      console.log('[SocialAuth] Returning extendedUser:', {
        uid: extendedUser.uid,
        email: extendedUser.email,
        role: extendedUser.role,
        businessId: extendedUser.businessId
      });

      // Final validation before returning
      if (!extendedUser || !extendedUser.uid) {
        console.error('[SocialAuth] CRITICAL ERROR: About to return invalid user object!');
        console.error('[SocialAuth] extendedUser:', extendedUser);
        throw new Error('Invalid user object - missing UID');
      }

      console.log('[SocialAuth] Final validation passed, returning user');
      console.log('[SocialAuth] ===== GOOGLE SIGN-IN FUNCTION COMPLETED SUCCESSFULLY =====');
      console.log('[SocialAuth] Function end timestamp:', new Date().toISOString());
      return extendedUser;
    } catch (error) {
      console.error('[SocialAuth] ===== GOOGLE SIGN-IN FUNCTION ERROR =====');
      console.error('[SocialAuth] Error timestamp:', new Date().toISOString());
      console.error('[SocialAuth] Google sign-in error:', error);
      console.error('[SocialAuth] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[SocialAuth] Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('[SocialAuth] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('[SocialAuth] ===== END ERROR DETAILS =====');
      throw error;
    }
  }, [contextHandleUserData]);

  // Other social sign-in methods
  const facebookSignIn = useCallback(async (): Promise<ExtendedUser> => {
    try {
      console.log('[SocialAuth] Starting Facebook sign-in');
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);

      // Create the extended user object with proper defaults
      const extendedUser: ExtendedUser = {
        ...userCredential.user,
        role: 'customer', // Default role for Facebook sign-in
        businesses: [],
        businessId: undefined,
        currentBusinessId: undefined,
        businessProfile: undefined
      };

      // Update the context with the processed user
      await contextHandleUserData(extendedUser);

      return extendedUser;
    } catch (error) {
      console.error('[SocialAuth] Facebook sign-in error:', error);
      throw error;
    }
  }, [contextHandleUserData]);

  const microsoftSignIn = useCallback(async (): Promise<ExtendedUser> => {
    try {
      console.log('[SocialAuth] Starting Microsoft sign-in');
      const provider = new OAuthProvider('microsoft.com');
      const userCredential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);

      // Create the extended user object with proper defaults
      const extendedUser: ExtendedUser = {
        ...userCredential.user,
        role: 'customer', // Default role for Microsoft sign-in
        businesses: [],
        businessId: undefined,
        currentBusinessId: undefined,
        businessProfile: undefined
      };

      // Update the context with the processed user
      await contextHandleUserData(extendedUser);

      return extendedUser;
    } catch (error) {
      console.error('[SocialAuth] Microsoft sign-in error:', error);
      throw error;
    }
  }, [contextHandleUserData]);

  const linkedInSignIn = useCallback(async (): Promise<ExtendedUser> => {
    try {
      console.log('[SocialAuth] Starting LinkedIn sign-in');
      // LinkedIn requires a custom OAuth flow, this is a placeholder
      throw new Error('LinkedIn sign in not implemented');
    } catch (error) {
      console.error('[SocialAuth] LinkedIn sign-in error:', error);
      throw error;
    }
  }, []);

  return {
    googleSignIn,
    facebookSignIn,
    microsoftSignIn,
    linkedInSignIn
  };
};