/**
 * User registration service
 * Handles user creation and document setup
 */
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { processPhoneNumber, handleCustomerRecord } from './phoneRegistrationService';
import { ExtendedUser } from '../types';
import { handleUserData } from './userDataService';

/**
 * Register a new user
 * 
 * @param email Email address
 * @param password Password
 * @param name Full name
 * @param role User role (business or customer)
 * @param phone Optional phone number
 * @returns Extended user object
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: 'business' | 'customer',
  phone?: string
): Promise<ExtendedUser> => {
  try {
    console.log('🔍 [USER REGISTRATION] Starting registration process');
    console.log('🔍 [USER REGISTRATION] Email:', email);
    console.log('🔍 [USER REGISTRATION] Name:', name);
    console.log('🔍 [USER REGISTRATION] Role:', role);
    console.log('🔍 [USER REGISTRATION] Phone:', phone);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ [USER REGISTRATION] User created in Firebase Auth:', user.uid);
    
    // Create base user document data
    let userData: any = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Process phone number if provided
    if (phone) {
    userData = processPhoneNumber(user.uid, phone, userData);
    }
    
    // Handle role-specific setup
    if (role === 'business') {
      userData = await setupBusinessAccount(user.uid, name, userData);
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ [USER REGISTRATION] Created user document in Firestore');
    
    // For customer role with phone, create/link customer record
    if (role === 'customer' && phone) {
      console.log('🔍 [REG DEBUG] Creating customer record...');
  try {
        await handleCustomerRecord(user.uid, email, name, phone);
        console.log('🔍 [REG DEBUG] Customer record created successfully');
  } catch (error) {
        console.error('🚨 [REG ERROR] Failed to create customer record:', error);
        // Don't throw - allow registration to complete even if customer record fails
  }
    } else {
      console.log('🔍 [REG DEBUG] Skipping customer record creation');
      console.log('🔍 [REG DEBUG] - Role is customer:', role === 'customer');
      console.log('🔍 [REG DEBUG] - Phone provided:', !!phone);
    }
    
    // Return extended user
    const extendedUser = await handleUserData(user);
    if (!extendedUser) {
      throw new Error('Failed to load user data after registration');
    }
    
    console.log('✅ [USER REGISTRATION] Registration complete for user:', user.uid);
    return extendedUser;
  } catch (error: any) {
    console.error('❌ [USER REGISTRATION] Registration error:', error);
    throw error;
  }
};

/**
 * Setup a business account
 * 
 * @param userId User ID
 * @param name Business name
 * @param userData Current user data
 * @returns Updated user data with business information
 */
export const setupBusinessAccount = async (
  userId: string,
  name: string,
  userData: any
): Promise<any> => {
  console.log('🔍 [USER REGISTRATION] Setting up business account for user:', userId);
  
  try {
    // Create a business document
    const businessRef = doc(collection(db, 'businesses'));
    const businessId = businessRef.id;
    
    const businessData = {
      businessId: businessId,
      businessName: name,
      industry: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: userId,
      active: true,
      businessNameLower: name.toLowerCase() // Add lowercase name for searching
    };
    
    await setDoc(businessRef, businessData);
    console.log('✅ [USER REGISTRATION] Created business document:', businessId);
    
    // Update user data with business reference
    userData.businessId = businessId;
    userData.businesses = [businessId];
    userData.currentBusinessId = businessId;
    
    return userData;
  } catch (error) {
    console.error('❌ [USER REGISTRATION] Error setting up business account:', error);
    throw error;
  }
};