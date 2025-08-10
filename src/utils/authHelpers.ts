import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { determineUserRole, getDefaultRouteForRole } from './roleUtils';
import { NavigateFunction } from 'react-router-dom';
import { findCustomerByPhone, linkUserToCustomer } from '../services/customerLinkingService';
import { toast } from 'react-toastify';

export interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accountType: 'customer' | 'business';
}

// Define a more complete user data interface
interface UserData {
  uid: string;
  role?: 'business' | 'customer';
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any; // Allow for additional properties
}

// Helper function to handle redirection after authentication
export const handleAuthSuccess = async (
  userId: string, 
  navigate: NavigateFunction, 
  explicitRole?: 'business' | 'customer'
) => {
  try {
    if (!userId) {
      console.error('[AuthHelpers] Invalid userId provided to handleAuthSuccess');
      throw new Error('Invalid user ID');
    }

    console.log('[AuthHelpers] Handling auth success for userId:', userId);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    // Get business profile if it exists
    let businessProfile = null;
    try {
      const businessDoc = await getDoc(doc(db, 'businesses', userId));
      if (businessDoc.exists()) {
        businessProfile = businessDoc.data();
        console.log('[AuthHelpers] Found business profile:', businessProfile);
    }
      } catch (error) {
      console.error('[AuthHelpers] Error fetching business profile:', error);
      }
    
    // Create user object with data from Firestore
    let userData: UserData;
      if (userDoc.exists()) {
      userData = {
          uid: userId,
        ...userDoc.data(),
        // If we have an explicit role from registration, use it
        role: explicitRole || userDoc.data().role || 'customer'
};
    } else {
      // If user document doesn't exist yet, create a basic one
      userData = { 
        uid: userId,
        role: explicitRole || 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Try to get additional info from Firebase Auth
      if (auth.currentUser) {
        userData.email = auth.currentUser.email || '';
        userData.displayName = auth.currentUser.displayName || '';
        userData.photoURL = auth.currentUser.photoURL || '';
      }
      
      // Create the user document
      try {
        await setDoc(doc(db, 'users', userId), userData);
        console.log('[AuthHelpers] Created new user document for:', userId);
      } catch (error) {
        console.error('[AuthHelpers] Error creating user document:', error);
      }
    }
    
    console.log('[AuthHelpers] User data for role determination:', userData);
    console.log('[AuthHelpers] Business profile for role determination:', businessProfile);
    
    // Use the centralized role determination utility
    const userRole = explicitRole || userData.role || determineUserRole(userData, businessProfile);
    console.log('[AuthHelpers] Determined user role:', userRole);
    
    // FIXED: Ensure business users are routed to business dashboard
    if (userRole === 'business' || explicitRole === 'business') {
      console.log('[AuthHelpers] Redirecting business user to business dashboard');
      navigate('/business/dashboard');
      return;
    }
    
    // Get the default route for the user's role
    const defaultRoute = getDefaultRouteForRole(userRole);
    console.log(`[AuthHelpers] Redirecting to ${defaultRoute}`);
    
    // Redirect based on role
    navigate(defaultRoute);
  } catch (error) {
    console.error('[AuthHelpers] Error in handleAuthSuccess:', error);
    // Default to customer dashboard if there's an error
    navigate('/customer/dashboard');
  }
};

// Handle registration form submission
export const handleRegistration = async (
  values: RegisterFormValues,
  accountType: 'customer' | 'business',
  register: (email: string, password: string, name: string, role: 'customer' | 'business', phone?: string) => Promise<any>,
  navigate: NavigateFunction,
  setIsLoading: (loading: boolean) => void,
  setLinkingSuccess: (success: boolean) => void
) => {
  setIsLoading(true);
  try {
    console.log(`[AuthHelpers] Registering new ${accountType} account for ${values.email}`);
    console.log(`[AuthHelpers] Phone number provided:`, values.phone);

    // Register the user with Firebase Authentication
    // Pass the phone number to the register function
    const userCredential = await register(
      values.email, 
      values.password, 
      values.name, 
      accountType,
      values.phone // Pass the phone number
    );
    if (!userCredential || !userCredential.uid) {
      console.error('[AuthHelpers] Invalid user credential returned from register function');
      throw new Error('Registration failed: Invalid user credential');
    }

    console.log('[AuthHelpers] User registered successfully with ID:', userCredential.uid);

    // If this is a business account, ensure we create the business document
    if (accountType === 'business') {
      try {
        console.log('[AuthHelpers] Setting up business account for:', userCredential.uid);

        // Create a business document with a generated ID
        const businessRef = doc(collection(db, 'businesses'));
        const businessId = businessRef.id;

        const businessData = {
          businessId: businessId,
          businessName: values.name || 'My Business',
          industry: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: userCredential.uid,
          active: true,
          businessNameLower: (values.name || 'My Business').toLowerCase()
        };

        await setDoc(businessRef, businessData);
        console.log('[AuthHelpers] Created business document with ID:', businessId);

        // Update user document with business reference
        const userDocRef = doc(db, 'users', userCredential.uid);
        await updateDoc(userDocRef, {
          businessId: businessId,
          businesses: [businessId],
          currentBusinessId: businessId,
          updatedAt: new Date()
        });

        console.log('[AuthHelpers] Updated user document with business reference');
      } catch (error) {
        console.error('[AuthHelpers] Error setting up business account:', error);
        // Don't fail the registration if business setup fails
      }
    }
    // If customer with phone number, try to link to existing customer profile
    else if (accountType === 'customer' && values.phone) {
  try {
        console.log('[AuthHelpers] Checking for existing customer with phone:', values.phone);
        
        // Find customer by phone
        const existingCustomer = await findCustomerByPhone(values.phone);
        
        if (existingCustomer) {
          console.log('[AuthHelpers] Found existing customer:', existingCustomer.id);
          
          // Link user to customer
          const linked = await linkUserToCustomer(userCredential.uid, existingCustomer.id);
          
          if (linked) {
            console.log('[AuthHelpers] Successfully linked user to existing customer');
            setLinkingSuccess(true);
          }
        } else {
          console.log('[AuthHelpers] No existing customer found with phone:', values.phone);
        }
    } catch (error) {
        console.error('[AuthHelpers] Error linking customer:', error);
        // Don't fail registration if linking fails
    }
    }
    
    // Rest of your existing code...
    toast.success('Account created successfully!');

    // Use the common auth success handler with the explicit role
    await handleAuthSuccess(userCredential.uid, navigate, accountType);
    
    // Return the user credential so it can be used by the caller
    return userCredential;
  } catch (error: any) {
    console.error('[AuthHelpers] Registration error:', error);
    toast.error(error.message || 'Failed to create account');
    return null;
  } finally {
    setIsLoading(false);
  }
};

// Handle social sign-in with improved error handling
export const handleSocialSignIn = async (
  signInMethod: () => Promise<any>,
  provider: string,
  accountType: 'customer' | 'business',
  navigate: NavigateFunction,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    console.log(`[AuthHelpers] Signing in with ${provider} as ${accountType}`);
    const result = await signInMethod();
    
    // Extract the user ID safely from the result
    let userId = null;
    
    // Check different possible formats of the authentication result
    if (result && result.user && result.user.uid) {
      // Standard Firebase UserCredential format
      userId = result.user.uid;
      console.log(`[AuthHelpers] Got user ID from result.user:`, userId);
    } else if (result && result.uid) {
      // Direct user object format
      userId = result.uid;
      console.log(`[AuthHelpers] Got user ID directly from result:`, userId);
    } else if (auth.currentUser) {
      // Fallback to current Firebase user
      userId = auth.currentUser.uid;
      console.log(`[AuthHelpers] Using current Firebase user as fallback:`, userId);
    }
    
    if (!userId) {
      console.error(`[AuthHelpers] Failed to get valid user ID after ${provider} sign-in`);
      console.error('[AuthHelpers] Result structure:', JSON.stringify(result, null, 2));
      throw new Error(`Invalid user data received after ${provider} sign-in`);
    }
    
    // For social sign-ins, we need to update the user's role in Firestore
    // based on the selected account type
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log(`[AuthHelpers] Updating existing user's role to ${accountType}`);
        await updateDoc(userDocRef, { 
          role: accountType,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new user document if it doesn't exist
        console.log(`[AuthHelpers] Creating new user document with role ${accountType}`);
        
        // Get user details from either result or auth.currentUser
        let email = '';
        let displayName = '';
        let photoURL = '';
        
        if (result && result.user) {
          email = result.user.email || '';
          displayName = result.user.displayName || '';
          photoURL = result.user.photoURL || '';
        } else if (result && result.email) {
          email = result.email || '';
          displayName = result.displayName || '';
          photoURL = result.photoURL || '';
        } else if (auth.currentUser) {
          email = auth.currentUser.email || '';
          displayName = auth.currentUser.displayName || '';
          photoURL = auth.currentUser.photoURL || '';
        }
        
        await setDoc(userDocRef, {
          uid: userId,
          email: email,
          displayName: displayName,
          photoURL: photoURL,
          role: accountType,
          authProvider: provider,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(`[AuthHelpers] Error updating user role after ${provider} sign-in:`, error);
      // Continue with auth success even if document update fails
    }
    
    // Use the common auth success handler with the explicit role
    await handleAuthSuccess(userId, navigate, accountType);
    
  } catch (error: any) {
    console.error(`[AuthHelpers] ${provider} sign-in error:`, error);
    toast.error(error.message || `Failed to sign in with ${provider}`);
  } finally {
    setIsLoading(false);
  }
};