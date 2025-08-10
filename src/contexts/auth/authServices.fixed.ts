import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  UserCredential,
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
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ExtendedUser } from './types';
import { BusinessProfile } from '../../types';

// Check for redirect result
export const checkRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    console.log('[DEBUG] Checking for redirect result');
    const result = await getRedirectResult(auth);
    console.log('[DEBUG] Redirect result:', result);
    return result;
  } catch (error) {
    console.error('[DEBUG] Error checking redirect result:', error);
    return null;
  }
};

// Login with email and password
export const loginWithEmail = async (email: string, password: string): Promise<ExtendedUser> => {
  try {
    console.log('Logging in user:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Make sure we're returning the full user object with all properties
    console.log('Login successful, user object:', userCredential.user);
    return userCredential.user as ExtendedUser;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'business' | 'customer'
): Promise<ExtendedUser> => {
  try {
    console.log('Starting registration with role:', role);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: name
    });

    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      role: role,
      businesses: role === 'business' ? [userCredential.user.uid] : [],
      currentBusinessId: role === 'business' ? userCredential.user.uid : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Creating user document:', userData);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    // If business user, create business document
    if (role === 'business') {
      const businessData = {
        businessId: userCredential.user.uid,
        businessName: name || email.split('@')[0],
        industry: 'Not specified',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        createdBy: userCredential.user.uid
      };

      console.log('Creating business document:', businessData);
      await setDoc(doc(db, 'businesses', userCredential.user.uid), businessData);
      
      // Add business owner as first user
      await setDoc(doc(db, 'businesses', userCredential.user.uid, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        name: name,
        role: 'owner',
        status: 'active',
        permissions: {
          manageUsers: true,
          manageSettings: true,
          manageCoupons: true,
          manageCustomers: true,
          viewAnalytics: true
        },
        joinedAt: serverTimestamp()
      });
    }
    
    return userCredential.user as ExtendedUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user');
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Reset password
export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Social sign-in methods with enhanced debug logging
export const socialSignIn = async (provider: string): Promise<UserCredential> => {
  try {
    console.log(`[DEBUG] Starting ${provider} sign-in process`);
    let authProvider;
    
    switch(provider) {
      case 'google':
        console.log('[DEBUG] Creating Google auth provider');
        authProvider = new GoogleAuthProvider();
        
        // Add these specific scopes to ensure we get the right permissions
        authProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
        authProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
        
        // Set custom parameters to improve popup behavior
        authProvider.setCustomParameters({
          prompt: 'select_account',
          login_hint: '',  // Leave empty to not pre-fill any email
        });
        break;
      case 'facebook':
        console.log('[DEBUG] Creating Facebook auth provider');
        authProvider = new FacebookAuthProvider();
        break;
      case 'microsoft':
        console.log('[DEBUG] Creating Microsoft auth provider');
        authProvider = new OAuthProvider('microsoft.com');
        break;
      case 'linkedin':
        console.log('[DEBUG] Creating LinkedIn auth provider');
        authProvider = new OAuthProvider('linkedin.com');
        break;
      default:
        console.error(`[DEBUG] Unsupported provider: ${provider}`);
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    console.log(`[DEBUG] ${provider} auth provider created:`, authProvider);
    
    // Use a try-catch specifically for the popup operation
    try {
      // Make sure we're properly awaiting the popup result
      console.log(`[DEBUG] Calling signInWithPopup for ${provider}`);
      const result = await signInWithPopup(auth, authProvider);
      console.log(`[DEBUG] ${provider} sign-in completed successfully`);
      
      // Verify we have a valid user object
      if (!result || !result.user) {
        throw new Error(`Invalid response from ${provider} authentication`);
      }
      
      return result;
    } catch (popupError: any) {
      console.error(`[DEBUG] Error in signInWithPopup for ${provider}:`, popupError);
      
      // Log specific error codes for debugging
      if (popupError.code === 'auth/popup-closed-by-user') {
        console.log('[DEBUG] User closed the popup window');
        throw new Error('Authentication canceled: you closed the login window');
      } else if (popupError.code === 'auth/popup-blocked') {
        console.log('[DEBUG] Popup was blocked by the browser');
        throw new Error('Authentication popup was blocked by your browser. Please check your popup blocker settings.');
      } else if (popupError.code === 'auth/cancelled-popup-request') {
        console.log('[DEBUG] Previous popup request was cancelled');
        throw new Error('Previous authentication request was canceled');
      } else if (popupError.code === 'auth/operation-not-allowed') {
        console.log('[DEBUG] The sign-in provider is disabled for this Firebase project');
        throw new Error(`${provider} authentication is not enabled for this application`);
      }
      
      throw popupError;
    }
  } catch (error: any) {
    console.error(`[DEBUG] ${provider} sign-in error:`, error);
    console.error(`[DEBUG] Error code:`, error.code);
    console.error(`[DEBUG] Error message:`, error.message);
    throw error;
  }
};

// Check for pending invitations
export const checkForInvitations = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef, 
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking for invitations:', error);
    return false;
  }
};