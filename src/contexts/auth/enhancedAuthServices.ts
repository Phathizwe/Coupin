import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ExtendedUser } from './types';
import { createBusinessForUser } from '../../services/businessRegistrationService';
import { logAnalyticsEvent } from '../../config/firebase';

/**
 * Enhanced registration function that ensures proper business document creation
 */
export const registerEnhancedUser = async (
  email: string,
  password: string,
  name: string,
  role: 'business' | 'customer'
): Promise<ExtendedUser> => {
  try {
    console.log(`[EnhancedAuth] Starting registration for ${email} as ${role}`);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`[EnhancedAuth] Firebase Auth user created: ${user.uid}`);
    
    // Create base user document
    const userData: any = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log(`[EnhancedAuth] User document created in Firestore`);
    
    // For business users, create a business document
    if (role === 'business') {
      try {
        const businessId = await createBusinessForUser(user.uid, {
          businessName: name
        });
        
        console.log(`[EnhancedAuth] Business created with ID: ${businessId}`);
        
        // Business ID is already linked to user by createBusinessForUser
        userData.businessId = businessId;
        userData.businesses = [businessId];
        userData.currentBusinessId = businessId;
      } catch (businessError: any) {
        console.error('[EnhancedAuth] Error creating business:', businessError);
        // Log the error but don't fail the registration
        logAnalyticsEvent('business_creation_error', {
          userId: user.uid,
          errorMessage: businessError?.message || 'Unknown error'
        });
      }
    }
    
    // Return extended user
    const extendedUser: ExtendedUser = {
      ...user,
      role: role,
      businesses: userData.businesses || [],
      businessId: userData.businessId || null,
      businessProfile: undefined
    };
    
    logAnalyticsEvent('user_registered', {
      role,
      hasBusinessId: !!userData.businessId
    });
    
    return extendedUser;
  } catch (error: any) {
    console.error('[EnhancedAuth] Registration error:', error);
    logAnalyticsEvent('registration_error', {
      errorMessage: error?.message || 'Unknown error',
      errorCode: error?.code || 'unknown_error'
    });
    throw error;
  }
};

/**
 * Enhanced login function with improved error handling
 */
export const enhancedLoginWithEmail = async (
  email: string, 
  password: string
): Promise<FirebaseUser> => {
  try {
    console.log(`[EnhancedAuth] Attempting login for: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    logAnalyticsEvent('user_login', {
      method: 'email'
    });
    
    return userCredential.user;
  } catch (error: any) {
    console.error('[EnhancedAuth] Login error:', error);
    logAnalyticsEvent('login_error', {
      errorMessage: error?.message || 'Unknown error',
      errorCode: error?.code || 'unknown_error'
    });
    throw error;
  }
};