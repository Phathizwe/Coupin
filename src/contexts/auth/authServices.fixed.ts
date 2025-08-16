/**
 * Enhanced authentication services with customer-user linking
 */
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
  Auth
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { findCustomerByPhone } from '../../services/customerLookupService';
import { linkCustomerToUser } from '../../services/customerLinkingService';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

/**
 * Register a new user with email and password
 * Enhanced with customer lookup and linking
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: 'customer' | 'business',
  phone?: string,
  businessName?: string
): Promise<UserCredential> => {
  try {
    console.log('🔄 Starting registration process...', { email, role, phone });
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Normalize phone number if provided
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : undefined;
    console.log('📞 Phone normalized:', { original: phone, normalized: normalizedPhone });
    
    // For customers, check for existing customer record BEFORE creating user record
    let linkedCustomerId: string | undefined;
    
    if (role === 'customer' && normalizedPhone) {
      console.log('🔍 Looking for existing customer with phone:', normalizedPhone);
      
      try {
        const existingCustomer = await findCustomerByPhone(normalizedPhone);
        
        if (existingCustomer) {
          console.log('✅ Found existing customer:', existingCustomer.id);
          linkedCustomerId = existingCustomer.id;
          
          // Update customer record with user ID using transaction
          await linkCustomerToUser(existingCustomer.id, user.uid);
          console.log('🔗 Customer linked to user successfully');
        } else {
          console.log('ℹ️ No existing customer found, will create new customer record');
        }
      } catch (error) {
        console.error('⚠️ Error during customer lookup:', error);
        // Continue with registration even if lookup fails
      }
    }
    
    // Create user document with proper linking
    const userData: any = {
      uid: user.uid,
      email: user.email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add phone number if provided
    if (normalizedPhone) {
      userData.phoneNumber = normalizedPhone;
    }
    
    // Add customer-specific fields
    if (role === 'customer') {
      if (linkedCustomerId) {
        userData.linkedCustomerId = linkedCustomerId;
        console.log('👤 User record will include linkedCustomerId:', linkedCustomerId);
      }
    }
    
    // Add business-specific fields
    if (role === 'business') {
      if (businessName) {
        userData.businessName = businessName;
      }
    }
    
    // Save user document
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('💾 User document created successfully');
    
    return userCredential;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
};

/**
 * Login with email and password
 */
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  return signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};