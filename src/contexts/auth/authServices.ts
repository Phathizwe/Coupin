/**
 * Authentication services
 * Refactored for better phone number handling and modularity
 */
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  getRedirectResult
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ExtendedUser } from './types';
import { registerUser } from './services/userRegistrationService';
import { handleUserData, debugUserData } from './services/userDataService';
import { fetchUserBusinesses } from './services/businessService';

// Login with email and password
export const loginWithEmail = async (email: string, password: string): Promise<ExtendedUser> => {
  try {
    console.log('🔍 [AUTH] Login attempt for email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('✅ [AUTH] Login successful for user:', userCredential.user.uid);
    const extendedUser = await handleUserData(userCredential.user);

    if (!extendedUser) {
      console.error('❌ [AUTH] Failed to load user data after login');
      throw new Error('Failed to load user data');
    }

    return extendedUser;
  } catch (error: any) {
    console.error('❌ [AUTH] Login error:', error);
    throw error;
  }
};

// Export the registerUser function from the module
export { registerUser };

// Sign out
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('🔍 [AUTH] Signing out user');
    await signOut(auth);
    console.log('✅ [AUTH] User signed out successfully');
  } catch (error) {
    console.error('❌ [AUTH] Sign out error:', error);
    throw error;
  }
};

// Reset password
export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    console.log('🔍 [AUTH] Sending password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('✅ [AUTH] Password reset email sent successfully');
  } catch (error) {
    console.error('❌ [AUTH] Reset password error:', error);
    throw error;
  }
};

// Social sign in - unified function for all social providers
export const socialSignIn = async (provider: 'google' | 'facebook' | 'microsoft' | 'linkedin'): Promise<ExtendedUser> => {
  try {
    console.log('🔍 [AUTH] Social sign-in attempt with provider:', provider);
    let authProvider;

    switch (provider) {
      case 'google':
        authProvider = new GoogleAuthProvider();
        break;
      case 'facebook':
        authProvider = new FacebookAuthProvider();
        break;
      case 'microsoft':
        authProvider = new OAuthProvider('microsoft.com');
        break;
      case 'linkedin':
        // LinkedIn requires a custom OAuth flow, this is a placeholder
        throw new Error('LinkedIn sign in not implemented');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const userCredential = await signInWithPopup(auth, authProvider);
    console.log('✅ [AUTH] Social sign-in successful for user:', userCredential.user.uid);

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      // First time social sign in, create user document
      console.log('🔍 [AUTH] First-time social sign-in, creating user document');
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        role: 'customer', // Default role
        createdAt: new Date()
      });
      console.log('✅ [AUTH] Created user document for social sign-in user');
    }

    const extendedUser = await handleUserData(userCredential.user);
    if (!extendedUser) {
      console.error('❌ [AUTH] Failed to load user data after social sign-in');
      throw new Error(`Failed to load user data after ${provider} sign-in`);
    }
    
    return extendedUser;
  } catch (error) {
    console.error(`❌ [AUTH] ${provider} sign in error:`, error);
    throw error;
  }
};

// Switch business
export const switchBusiness = async (userId: string, businessId: string): Promise<void> => {
  try {
    console.log('🔍 [AUTH] Switching business for user:', userId);
    console.log('🔍 [AUTH] New business ID:', businessId);
    
    const userRef = doc(db, 'users', userId);

    // Update current business ID
    await updateDoc(userRef, {
      currentBusinessId: businessId
    });
    
    console.log('✅ [AUTH] Successfully switched business');
  } catch (error) {
    console.error('❌ [AUTH] Switch business error:', error);
    throw error;
  }
};

// Check for user invitations
export const checkForInvitations = async (email: string): Promise<boolean> => {
  try {
    console.log('🔍 [AUTH] Checking for invitations for email:', email);
    
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('email', '==', email),
      where('status', '==', 'pending')
    );

    const invitationsSnapshot = await getDocs(invitationsQuery);
    const hasInvitations = !invitationsSnapshot.empty;
    
    console.log('🔍 [AUTH] Invitations found:', hasInvitations);
    return hasInvitations;
  } catch (error) {
    console.error('❌ [AUTH] Check invitations error:', error);
    return false;
  }
};

// Check redirect result for auth redirects
export const checkRedirectResult = async () => {
  try {
    console.log('🔍 [AUTH] Checking redirect result');
    const result = await getRedirectResult(auth);

    if (result) {
      console.log('✅ [AUTH] Redirect result found for user:', result.user.uid);
      return result.user;
    }

    console.log('ℹ️ [AUTH] No redirect result found');
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Check redirect result error:', error);
    return null;
  }
};

// Export the handleUserData function from the module
export { handleUserData, debugUserData, fetchUserBusinesses };