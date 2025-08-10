import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { determineUserRole, getDefaultRouteForRole } from './roleUtils';
import { NavigateFunction } from 'react-router-dom';
import { findCustomerByPhone, linkUserToCustomer } from '../services/customerLinkingService';
import { toast } from 'react-toastify';
import { ensureUserHasBusiness } from '../services/businessRegistrationService';
import { diagnoseBusiness, fixBusinessRegistration } from './registrationDiagnostics';
import { logAnalyticsEvent } from '../config/firebase';

export interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: 'customer' | 'business';
}

/**
 * Enhanced handler for authentication success with better error handling
 */
export const enhancedHandleAuthSuccess = async (
  userId: string, 
  navigate: NavigateFunction, 
  explicitRole?: 'business' | 'customer'
): Promise<void> => {
  try {
    if (!userId) {
      console.error('[EnhancedAuthHelpers] Invalid userId provided');
      toast.error('Authentication error: Invalid user ID');
      navigate('/login');
      return;
    }

    console.log('[EnhancedAuthHelpers] Handling auth success for userId:', userId);
    
    // Get user data from Firestore
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('[EnhancedAuthHelpers] User document does not exist');
      toast.error('User profile not found');
      navigate('/login');
      return;
    }
    
    const userData = userDoc.data();
    const userRole = explicitRole || userData.role || 'customer';
    
    // For business users, ensure they have a business
    if (userRole === 'business') {
      try {
        // Ensure user has a business document
        await ensureUserHasBusiness(userId, userData.displayName || 'My Business');
        
        // Run diagnostics to check if everything is set up correctly
        const diagnostics = await diagnoseBusiness(userId);
        
        if (!diagnostics.success) {
          console.warn('[EnhancedAuthHelpers] Business setup issues detected:', diagnostics.issues);
          
          // Try to fix common issues
          const fixResult = await fixBusinessRegistration(userId);
          
          if (!fixResult.fixed) {
            console.error('[EnhancedAuthHelpers] Could not fix business setup issues');
            toast.warning('Your business profile setup is incomplete. Some features may be limited.');
          } else {
            console.log('[EnhancedAuthHelpers] Fixed business setup issues');
          }
        }
        
        // Redirect to business dashboard
        console.log('[EnhancedAuthHelpers] Redirecting business user to dashboard');
        navigate('/business/dashboard');
        return;
      } catch (error) {
        console.error('[EnhancedAuthHelpers] Error ensuring business setup:', error);
        // Continue with redirection despite error
      }
    }
    
    // Get the default route for the user's role
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`[EnhancedAuthHelpers] Redirecting to ${defaultRoute}`);
    
    // Redirect based on role
    navigate(defaultRoute);
    
  } catch (error) {
    console.error('[EnhancedAuthHelpers] Error in handleAuthSuccess:', error);
    toast.error('Error loading your profile');
    navigate('/login');
  }
};

/**
 * Enhanced registration handler with better error handling and diagnostics
 */
export const enhancedHandleRegistration = async (
  values: RegisterFormValues,
  accountType: 'customer' | 'business',
  register: (email: string, password: string, name: string, role: 'customer' | 'business') => Promise<any>,
  navigate: NavigateFunction,
  setIsLoading: (loading: boolean) => void,
  setLinkingSuccess: (success: boolean) => void
): Promise<any> => {
  setIsLoading(true);
  
  try {
    console.log(`[EnhancedAuthHelpers] Registering new ${accountType} account for ${values.email}`);
    
    // Track registration start time for performance monitoring
    const startTime = performance.now();
    
    // Register the user - ensure we're properly handling the return value
    const userCredential = await register(values.email, values.password, values.name, accountType);
    
    // Check if we have a valid user credential
    if (!userCredential) {
      console.error('[EnhancedAuthHelpers] Registration returned null or undefined');
      throw new Error('Registration failed: No user credential returned');
    }
    
    // Extract user ID safely - handle different credential formats
    let userId: string;
    
    if (typeof userCredential === 'object') {
      if ('uid' in userCredential) {
        // Direct user object
        userId = userCredential.uid;
      } else if ('user' in userCredential && userCredential.user && 'uid' in userCredential.user) {
        // UserCredential format
        userId = userCredential.user.uid;
    } else {
        // Fall back to current user if available
        userId = auth.currentUser?.uid || '';
    }
    } else {
      // Fall back to current user if available
      userId = auth.currentUser?.uid || '';
    }
    
    if (!userId) {
      console.error('[EnhancedAuthHelpers] Could not determine user ID from registration result');
      throw new Error('Registration failed: Invalid user credential');
    }
    
    console.log('[EnhancedAuthHelpers] User registered successfully with ID:', userId);
    
    // For customer accounts with phone number, try to link to existing customer profile
    if (accountType === 'customer' && values.phone) {
      try {
        console.log('[EnhancedAuthHelpers] Looking for existing customer profile');
        const existingCustomer = await findCustomerByPhone(values.phone);
        
        if (existingCustomer) {
          await linkUserToCustomer(userId, existingCustomer.id);
          setLinkingSuccess(true);
          toast.success('Your account has been linked to your existing customer profile!');
  }
      } catch (linkError) {
        console.error('[EnhancedAuthHelpers] Error linking customer profile:', linkError);
      }
    }
    
    // For business accounts, run diagnostics to ensure proper setup
    if (accountType === 'business') {
      try {
        console.log('[EnhancedAuthHelpers] Running business setup diagnostics');
        const diagnostics = await diagnoseBusiness(userId);
        
        if (!diagnostics.success) {
          console.warn('[EnhancedAuthHelpers] Business setup issues detected:', diagnostics.issues);
          
          // Try to fix common issues
          await fixBusinessRegistration(userId);
        }
      } catch (diagError) {
        console.error('[EnhancedAuthHelpers] Error running diagnostics:', diagError);
      }
    }
    
    // Calculate registration duration for performance monitoring
    const duration = performance.now() - startTime;
    logAnalyticsEvent('registration_performance', {
      duration,
      accountType
    });
    
    toast.success('Account created successfully!');
    
    // Handle auth success and redirection
    await enhancedHandleAuthSuccess(userId, navigate, accountType);
    
    // Return the user ID and credential for potential further use
    return { uid: userId, ...userCredential };
  } catch (error: any) {
    console.error('[EnhancedAuthHelpers] Registration error:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      toast.error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      toast.error('Please use a stronger password (at least 6 characters).');
    } else {
      toast.error(error.message || 'Failed to create account');
    }
    
    logAnalyticsEvent('registration_error', {
      errorCode: error.code || 'unknown',
      errorMessage: error.message || 'Unknown error'
    });
    
    return null;
  } finally {
    setIsLoading(false);
  }
};