/**
 * Enhanced authentication services with customer-user linking
 * and invitation handling
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
import { 
  findInvitationsByPhone, 
  acceptPendingInvitations 
} from '../../services/invitationRelationshipService';

/**
 * Register a new user with email and password
 * Enhanced with customer lookup, linking, and invitation handling
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: 'customer' | 'business',
  phone?: string
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
    let invitingBusinessIds: string[] = [];
    
    if (role === 'customer' && normalizedPhone) {
      console.log('🔍 Looking for existing customer with phone:', normalizedPhone);
      
      try {
        // Step 1: Find existing customer by phone
        const existingCustomer = await findCustomerByPhone(normalizedPhone);
        
        if (existingCustomer) {
          console.log('✅ Found existing customer:', existingCustomer.id);
          linkedCustomerId = existingCustomer.id;
          
          // Update customer record with user ID using transaction
          await linkCustomerToUser(existingCustomer.id, user.uid);
          console.log('🔗 Customer linked to user successfully');
        }
        
        // Step 2: Check for pending invitations regardless of whether customer exists
        const pendingInvitations = await findInvitationsByPhone(normalizedPhone);
        
        if (pendingInvitations.length > 0) {
          console.log(`✉️ Found ${pendingInvitations.length} pending invitations`);
          
          // Extract business IDs for user record
          invitingBusinessIds = pendingInvitations.map(inv => inv.businessId);
          
          // If we have a customer ID (either existing or new), accept the invitations
          if (linkedCustomerId) {
            console.log('🔄 Accepting pending invitations for customer:', linkedCustomerId);
            await acceptPendingInvitations(linkedCustomerId, normalizedPhone);
          }
          // If no customer ID yet, invitations will be accepted after customer creation
        }
      } catch (error) {
        console.error('⚠️ Error during customer lookup or invitation handling:', error);
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
      
      if (invitingBusinessIds.length > 0) {
        userData.invitingBusinessIds = invitingBusinessIds;
        console.log('🏢 User record will include invitingBusinessIds:', invitingBusinessIds);
      }
    }
    
    // Add business-specific fields
    if (role === 'business') {
      // Business name is handled separately in business profile creation
    }
    
    // Save user document
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('💾 User document created successfully');
    
    // If we have invitations but no customer record yet, create one and accept invitations
    if (role === 'customer' && normalizedPhone && invitingBusinessIds.length > 0 && !linkedCustomerId) {
      try {
        console.log('🔄 Creating new customer record for invited user');
        
        // Create customer record
        const customersRef = doc(db, 'customers', `customer_${user.uid}`);
        const customerData = {
          id: customersRef.id,
          userId: user.uid,
          phone: normalizedPhone,
          email: email,
          name: displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(customersRef, customerData);
        console.log('✅ Created new customer record:', customersRef.id);
        
        // Accept pending invitations
        await acceptPendingInvitations(customersRef.id, normalizedPhone);
        
        // Update user with customer ID
        await setDoc(doc(db, 'users', user.uid), {
          linkedCustomerId: customersRef.id,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('❌ Error creating customer record or accepting invitations:', error);
        // Continue with registration even if this fails
      }
    }
    
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