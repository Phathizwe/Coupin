import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { determineUserRole, getDefaultRouteForRole } from '../../utils/roleUtils';
import { UserData } from './types';

export const useAuthSuccessHandler = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper function to handle redirection after authentication with enhanced debugging
  const handleAuthSuccess = async (userId: string) => {
    try {
      // Validate userId
      if (!userId) {
        console.error('[DEBUG][AuthSuccess] Invalid userId in handleAuthSuccess');
        throw new Error('Invalid user ID');
      }

      console.log('[DEBUG][AuthSuccess] Starting handleAuthSuccess for user:', userId);
      console.log('[DEBUG][AuthSuccess] Current Firebase auth state:', 
        auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          providerId: auth.currentUser.providerId,
          providerData: auth.currentUser.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            email: p.email
          }))
        } : 'No current user'
      );
      
      // Get user data from Firestore
      console.log('[DEBUG][AuthSuccess] Fetching user document from Firestore');
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      console.log('[DEBUG][AuthSuccess] User document exists:', userDoc.exists());
      
      // Initialize userData with a default structure to prevent undefined errors
      let userData: UserData = { 
        uid: userId,
        role: 'customer' // Default role if not found
      };
      
      if (userDoc.exists()) {
        console.log('[DEBUG][AuthSuccess] User document data:', userDoc.data());
        userData = {
          ...userData,
          ...userDoc.data() as object
        };
      } else {
        console.log('[DEBUG][AuthSuccess] No user document found in Firestore, creating one');
        // Create a basic user document if none exists
        if (auth.currentUser) {
          userData = {
            uid: userId,
            email: auth.currentUser.email || '', // Convert null to empty string
            displayName: auth.currentUser.displayName || '', // Convert null to empty string
            photoURL: auth.currentUser.photoURL || '', // Convert null to empty string
            role: 'customer',
            authProvider: 'google',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          // Save the new user data
          try {
            await setDoc(userDocRef, userData);
            console.log('[DEBUG][AuthSuccess] Created new user document');
          } catch (error) {
            console.error('[DEBUG][AuthSuccess] Error creating user document:', error);
          }
        }
      }
      
      // Get business profile if it exists
      let businessProfile = null;
      try {
        console.log('[DEBUG][AuthSuccess] Checking for business profile with ID:', userId);
        const businessDocRef = doc(db, 'businesses', userId);
        const businessDoc = await getDoc(businessDocRef);
        console.log('[DEBUG][AuthSuccess] Business document exists:', businessDoc.exists());
        
        if (businessDoc.exists()) {
          businessProfile = businessDoc.data();
          console.log('[DEBUG][AuthSuccess] Business profile data:', businessProfile);
        } else {
          console.log('[DEBUG][AuthSuccess] No business profile found for this user');
        }
      } catch (error) {
        console.error('[DEBUG][AuthSuccess] Error fetching business profile:', error);
      }
      
      console.log('[DEBUG][AuthSuccess] User data for role determination:', userData);
      console.log('[DEBUG][AuthSuccess] User role from Firestore:', userData.role || 'undefined');
      
      if (!userData.role && auth.currentUser) {
        console.log('[DEBUG][AuthSuccess] No role in Firestore, checking auth provider data');
        const providerData = auth.currentUser.providerData;
        console.log('[DEBUG][AuthSuccess] Provider data:', providerData);
      }
      
      // Use the centralized role determination utility with the user data we have
      console.log('[DEBUG][AuthSuccess] Calling determineUserRole');
      const userRole = determineUserRole(userData, businessProfile);
      console.log('[DEBUG][AuthSuccess] Determined user role:', userRole);
      
      // Get the default route for the user's role
      const defaultRoute = getDefaultRouteForRole(userRole);
      console.log(`[DEBUG][AuthSuccess] Default route for role ${userRole}:`, defaultRoute);
      
      // Redirect based on role
      console.log(`[DEBUG][AuthSuccess] Redirecting to ${defaultRoute}`);
      navigate(defaultRoute);
      console.log(`[DEBUG][AuthSuccess] Navigation initiated`);
    } catch (error: any) {
      console.error('[DEBUG][AuthSuccess] Error in handleAuthSuccess:', error);
      console.error('[DEBUG][AuthSuccess] Error type:', typeof error);
      console.error('[DEBUG][AuthSuccess] Error name:', error.name);
      console.error('[DEBUG][AuthSuccess] Error message:', error.message);
      console.error('[DEBUG][AuthSuccess] Error stack:', error.stack);
      
      setLoginError(`Error after login: ${error.message || 'Unknown error'}`);
      
      console.log('[DEBUG][AuthSuccess] Falling back to customer dashboard due to error');
      // Default to customer dashboard if there's an error
      navigate('/customer/dashboard');
    }
  };

  return {
    handleAuthSuccess,
    loginError,
    setLoginError
  };
};