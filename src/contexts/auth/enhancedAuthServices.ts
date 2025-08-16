import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { ExtendedUser } from './types';
import { BusinessProfile } from '../../types';
import { findCustomerByPhone } from '../../services/customerLookupService';

// Enhanced registration with robust customer-user linking
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: 'business' | 'customer',
  phone?: string
): Promise<ExtendedUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('[authServices] User created in Firebase Auth:', user.uid);

    // Create user document
    const userData: any = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: new Date(),
    };

    // Add phone number if provided
    if (phone) {
      userData.phoneNumber = phone;
    }

    // Handle business registration
    if (role === 'business') {
      console.log('[authServices] Creating business document for business user');

      // Create a business document
      const businessRef = doc(collection(db, 'businesses'));
      const businessId = businessRef.id;

      const businessData = {
        businessId: businessId,
        businessName: name,
        industry: '',
        createdAt: new Date(),
        ownerId: user.uid,
        active: true,
        businessNameLower: name.toLowerCase() // Add lowercase name for searching
      };

      await setDoc(businessRef, businessData);
      console.log('[authServices] Created business document:', businessId);

      // Update user with business reference
      userData.businessId = businessId;
      userData.businesses = [businessId];
      userData.currentBusinessId = businessId;
    } 
    // Enhanced customer registration with robust linking
    else if (role === 'customer' && phone) {
      console.log('[authServices] Processing customer registration with phone:', phone);
      
      try {
        // Use transaction to ensure data consistency
        await runTransaction(db, async (transaction) => {
          // Check if a customer with this phone already exists
          const existingCustomer = await findCustomerByPhone(phone);
          
          if (existingCustomer) {
            console.log('[authServices] Found existing customer:', existingCustomer.id);
            
            // Verify the customer doesn't already have a userId
            if (!existingCustomer.userId) {
              console.log('[authServices] Linking user to existing customer');
              
              // Update customer with user ID using transaction
              const customerRef = doc(db, 'customers', existingCustomer.id);
              transaction.update(customerRef, { 
                userId: user.uid,
                email: email, // Update email to match user account
                updatedAt: serverTimestamp()
              });
              
              console.log('[authServices] Successfully linked user to customer');
            } else {
              console.log('[authServices] Customer already has userId:', existingCustomer.userId);
              
              // Check if the existing userId matches current user
              if (existingCustomer.userId !== user.uid) {
                throw new Error('Phone number already associated with another account');
              }
            }
          } else {
            console.log('[authServices] No existing customer found, creating new customer record');
            
            // Create a new customer record
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            const customerData = {
              firstName,
              lastName,
              email: email,
              phone: phone,
              phone_normalized: phone.replace(/\D/g, ''), // Store normalized version
              userId: user.uid,
              joinDate: serverTimestamp(),
              createdAt: serverTimestamp()
            };
            
            const newCustomerRef = doc(collection(db, 'customers'));
            transaction.set(newCustomerRef, customerData);
            
            console.log('[authServices] Created new customer record:', newCustomerRef.id);
          }
        });
        
        console.log('[authServices] Customer linking transaction completed successfully');
      } catch (linkingError) {
        console.error('[authServices] Customer linking failed:', linkingError);
        // Don't fail the entire registration, but log the issue
        console.warn('[authServices] Continuing with user creation despite linking failure');
      }
    }

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('[authServices] Created user document in Firestore');

    // Return extended user
    const extendedUser = await handleUserData(user);
    if (!extendedUser) {
      throw new Error('Failed to load user data after registration');
    }
    return extendedUser;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login with email and password
export const loginWithEmail = async (email: string, password: string): Promise<ExtendedUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const extendedUser = await handleUserData(userCredential.user);

    if (!extendedUser) {
      throw new Error('Failed to load user data');
    }

    return extendedUser;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// Sign out
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Reset password
export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Social sign in - unified function for all social providers
export const socialSignIn = async (provider: 'google' | 'facebook' | 'microsoft' | 'linkedin'): Promise<ExtendedUser> => {
  try {
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

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      // First time social sign in, create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        role: 'customer', // Default role
        createdAt: new Date()
      });
    }

    const extendedUser = await handleUserData(userCredential.user);
    if (!extendedUser) {
      throw new Error(`Failed to load user data after ${provider} sign-in`);
    }
    return extendedUser;
  } catch (error) {
    console.error(`${provider} sign in error:`, error);
    throw error;
  }
};

// Switch business
export const switchBusiness = async (userId: string, businessId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);

    // Update current business ID
    await updateDoc(userRef, {
      currentBusinessId: businessId
    });
  } catch (error) {
    console.error('Switch business error:', error);
    throw error;
  }
};

// Fetch user businesses
export const fetchUserBusinesses = async (userId: string): Promise<BusinessProfile[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const businesses = userData.businesses || [];

    if (businesses.length === 0) {
      return [];
    }

    const businessProfiles: BusinessProfile[] = [];

    for (const businessId of businesses) {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));

      if (businessDoc.exists()) {
        const businessData = businessDoc.data();

        businessProfiles.push({
          businessId: businessId,
          businessName: businessData.businessName || '',
          industry: businessData.industry || '',
          address: businessData.address || '',
          phone: businessData.phone || '',
          website: businessData.website || '',
          logo: businessData.logo || '',
          colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' },
          subscriptionTier: businessData.subscriptionTier || 'free',
          subscriptionStatus: businessData.subscriptionStatus || 'active'
        });
      }
    }

    return businessProfiles;
  } catch (error) {
    console.error('Fetch user businesses error:', error);
    return [];
  }
};

// Check for user invitations
export const checkForInvitations = async (email: string): Promise<boolean> => {
  try {
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('email', '==', email),
      where('status', '==', 'pending')
    );

    const invitationsSnapshot = await getDocs(invitationsQuery);

    return !invitationsSnapshot.empty;
  } catch (error) {
    console.error('Check invitations error:', error);
    return false;
  }
};

// Check redirect result for auth redirects
export const checkRedirectResult = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      return result.user;
    }

    return null;
  } catch (error) {
    console.error('Check redirect result error:', error);
    return null;
  }
};

// Handle user data
export const handleUserData = async (firebaseUser: FirebaseUser): Promise<ExtendedUser | null> => {
  if (!firebaseUser) {
    console.error('[handleUserData] No Firebase user provided');
    return null;
  }

  try {
    console.log('[handleUserData] Processing user data for:', firebaseUser.uid);

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    // Create a base extended user object with proper type handling
    const extendedUser: ExtendedUser = {
      ...firebaseUser,
      role: 'customer', // Default role
      businesses: [],
      businessId: undefined,
      currentBusinessId: undefined,
      businessProfile: undefined
    };

    if (userDoc.exists()) {
      const docData = userDoc.data();

      // Add Firestore data to the extended user
      extendedUser.role = docData.role || 'customer';
      extendedUser.businessId = docData.businessId || undefined;
      extendedUser.businesses = docData.businesses || [];
      extendedUser.currentBusinessId = docData.currentBusinessId || docData.businessId || undefined;
      
      // Add phone number if it exists
      if (docData.phoneNumber) {
        extendedUser.phoneNumber = docData.phoneNumber;
      }

      // Ensure businessId is set correctly for business users
      if (extendedUser.role === 'business') {
        // If no businessId but we have businesses array
        if (!extendedUser.businessId && extendedUser.businesses && extendedUser.businesses.length > 0) {
          extendedUser.businessId = extendedUser.businesses[0];
          extendedUser.currentBusinessId = extendedUser.businesses[0];

          // Update the user document with the businessId
          await updateDoc(userDocRef, {
            businessId: extendedUser.businessId,
            currentBusinessId: extendedUser.currentBusinessId
          });
        }
        // If no businesses array but we have a businessId
        else if (extendedUser.businessId && (!extendedUser.businesses || extendedUser.businesses.length === 0)) {
          extendedUser.businesses = [extendedUser.businessId];

          // Update the user document with the businesses array
          await updateDoc(userDocRef, {
            businesses: extendedUser.businesses
          });
        }
        // If no businessId and no businesses array, create a new business
        else if ((!extendedUser.businessId || extendedUser.businessId === '') &&
          (!extendedUser.businesses || extendedUser.businesses.length === 0)) {
          // Create a new business
          const businessRef = doc(collection(db, 'businesses'));
          const businessId = businessRef.id;

          await setDoc(businessRef, {
            businessId: businessId,
            businessName: firebaseUser.displayName || 'My Business',
            industry: '',
            createdAt: new Date(),
            ownerId: firebaseUser.uid,
            active: true,
            businessNameLower: (firebaseUser.displayName || 'My Business').toLowerCase()
          });

          // Update user with business reference
          extendedUser.businessId = businessId;
          extendedUser.businesses = [businessId];
          extendedUser.currentBusinessId = businessId;

          await updateDoc(userDocRef, {
            businessId: businessId,
            businesses: [businessId],
            currentBusinessId: businessId
          });
        }
      }
    } else {
      // User document doesn't exist, create one
      const role = 'customer'; // Default for Google sign-in users

      const userData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: role,
        createdAt: new Date()
      };

      // Save user data to Firestore
      await setDoc(userDocRef, userData);

      // Update extended user with the role
      extendedUser.role = role;
    }

    // If we have a businessId, fetch the business profile
    if (extendedUser.businessId) {
      const businessDocRef = doc(db, 'businesses', extendedUser.businessId);
      const businessDoc = await getDoc(businessDocRef);

      if (businessDoc.exists()) {
        const businessData = businessDoc.data();
        extendedUser.businessProfile = {
          businessId: extendedUser.businessId,
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
      } else if (extendedUser.role === 'business') {
        // Business document doesn't exist but should, create it
        await setDoc(businessDocRef, {
          businessId: extendedUser.businessId,
          businessName: firebaseUser.displayName || 'My Business',
          industry: '',
          createdAt: new Date(),
          ownerId: firebaseUser.uid,
          active: true,
          businessNameLower: (firebaseUser.displayName || 'My Business').toLowerCase()
        });

        // Set business profile
        extendedUser.businessProfile = {
          businessId: extendedUser.businessId,
          businessName: firebaseUser.displayName || 'My Business',
          industry: '',
          address: '',
          phone: '',
          website: '',
          logo: '',
          colors: { primary: '#3B82F6', secondary: '#10B981' },
          subscriptionTier: 'free',
          subscriptionStatus: 'active'
        };
      }
    }

    return extendedUser;
  } catch (error) {
    console.error('[handleUserData] Error processing user data:', error);
    return null;
  }
};