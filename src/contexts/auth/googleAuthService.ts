import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential
} from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Enhanced Google Sign-In function that handles both popup and redirect methods
 * with better error handling and debugging
 */
export const enhancedGoogleSignIn = async (): Promise<UserCredential> => {
  try {
    console.log('[GoogleAuth] Starting Google sign-in process');
    
    // Create a new Google auth provider instance
    const provider = new GoogleAuthProvider();
    
    // Add necessary scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    // Set custom parameters
    provider.setCustomParameters({
      // Force account selection even if user is already signed in
      prompt: 'select_account'
    });
    
    // First try using popup method (preferred for better UX)
    try {
      console.log('[GoogleAuth] Attempting sign-in with popup');
      const result = await signInWithPopup(auth, provider);
      console.log('[GoogleAuth] Popup sign-in successful', result);
      
      // Save user data to Firestore if needed
      await saveUserToFirestore(result);
      
      return result;
    } catch (popupError: any) {
      console.warn('[GoogleAuth] Popup sign-in failed:', popupError);
      
      // If popup is blocked or fails, fall back to redirect method
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        console.log('[GoogleAuth] Falling back to redirect method');
        // Use redirect method as fallback
        await signInWithRedirect(auth, provider);
        // This function will not return here as the page will redirect
        // The result will be handled on page load by getRedirectResult()
        throw new Error('Redirecting to Google sign-in...');
      }
      
      // For other errors, rethrow
      throw popupError;
    }
  } catch (error: any) {
    console.error('[GoogleAuth] Google sign-in error:', error);
    throw error;
  }
};

/**
 * Check for redirect result on page load
 * Call this function when your app initializes
 */
export const checkGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    console.log('[GoogleAuth] Checking for redirect result');
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('[GoogleAuth] Redirect result found:', result);
      // Save user data to Firestore if needed
      await saveUserToFirestore(result);
      return result;
    }
    
    console.log('[GoogleAuth] No redirect result found');
    return null;
  } catch (error) {
    console.error('[GoogleAuth] Error checking redirect result:', error);
    return null;
  }
};

/**
 * Helper function to save user data to Firestore
 */
async function saveUserToFirestore(credential: UserCredential): Promise<void> {
  if (!credential || !credential.user) {
    console.error('[GoogleAuth] Invalid credential or user object');
    return;
  }
  
  const { user } = credential;
  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if user document already exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      console.log('[GoogleAuth] Creating new user document for:', user.uid);
      
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'customer', // Default role for Google sign-ins
        authProvider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, userData);
      console.log('[GoogleAuth] User document created successfully');
    } else {
      // Update existing user document with latest info
      console.log('[GoogleAuth] Updating existing user document');
      
      await updateDoc(userRef, {
        email: user.email || userDoc.data().email,
        displayName: user.displayName || userDoc.data().displayName,
        photoURL: user.photoURL || userDoc.data().photoURL,
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      console.log('[GoogleAuth] User document updated successfully');
    }
  } catch (error) {
    console.error('[GoogleAuth] Error saving user to Firestore:', error);
    // Don't throw here - we still want to proceed with auth even if Firestore fails
  }
}