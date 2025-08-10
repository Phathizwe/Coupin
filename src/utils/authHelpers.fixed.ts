import { doc, collection, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { NavigateFunction } from 'react-router-dom';
import { db } from '../config/firebase';
import { findCustomerByPhone } from '../services/customerLookupService';
import { linkUserToCustomer } from '../services/customerLinkingService';

// Define the RegisterFormValues interface
interface RegisterFormValues {
  email: string;
  password: string;
  name: string;
  phone?: string;
  [key: string]: any; // Allow for additional properties
}

// Handle auth success after login or registration
export const handleAuthSuccess = async (
  userId: string,
  navigate: NavigateFunction,
  role: 'customer' | 'business'
) => {
  console.log(`[AuthHelpers] Handling auth success for ${role} with ID:`, userId);
  
  // Redirect based on role
  if (role === 'business') {
    navigate('/business/dashboard');
  } else {
    navigate('/customer/home');
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

    // If business account, create a business document
    if (accountType === 'business') {
      try {
        console.log('[AuthHelpers] Setting up business account');

        // Create a business document with a generated ID
        const businessRef = doc(collection(db, 'businesses'));
        const businessId = businessRef.id;

        const businessData = {
          businessId: businessId,
          businessName: values.name,
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
          await linkUserToCustomer(userCredential.uid, existingCustomer.id);
          setLinkingSuccess(true);
          console.log('[AuthHelpers] Linked user to existing customer profile:', existingCustomer.id);
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