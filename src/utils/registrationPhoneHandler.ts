/**
 * Registration Phone Handler
 * Specialized utility for handling phone numbers during registration
 */
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber, isValidSouthAfricanPhone, generatePhoneAlternatives } from './phoneUtils.enhanced';
import { debugPhoneRegistration } from './registrationDiagnostics';

/**
 * Ensure phone number is stored in user profile
 * This function can be called after registration to verify and fix phone number issues
 * 
 * @param userId User ID
 * @param phone Phone number
 * @returns Success status
 */
export const ensurePhoneNumberStored = async (userId: string, phone?: string): Promise<boolean> => {
  if (!userId) {
    console.error('❌ [PHONE HANDLER] No user ID provided');
    return false;
  }
  
  console.log('🔍 [PHONE HANDLER] Ensuring phone number is stored for user:', userId);
  console.log('🔍 [PHONE HANDLER] Phone number:', phone);
  
  try {
    // Get user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ [PHONE HANDLER] User document does not exist');
      return false;
    }
    
    const userData = userDoc.data();
    console.log('🔍 [PHONE HANDLER] Current user data:', userData);
    
    // Check if phone number already exists in user document
    if (userData.phoneNumber) {
      console.log('✅ [PHONE HANDLER] Phone number already exists in user document:', userData.phoneNumber);
      
      // If a new phone number was provided and it's different, update it
      if (phone && normalizePhoneNumber(phone) !== userData.phoneNumber) {
        console.log('🔍 [PHONE HANDLER] Updating existing phone number with new one');
        
        const normalizedPhone = normalizePhoneNumber(phone);
        await updateDoc(userDocRef, {
          phoneNumber: normalizedPhone,
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ [PHONE HANDLER] Updated phone number in user document:', normalizedPhone);
      }
      
      return true;
    }
    
    // No phone number in user document, but one was provided
    if (phone) {
      console.log('🔍 [PHONE HANDLER] Adding missing phone number to user document');
      
      const normalizedPhone = normalizePhoneNumber(phone);
      await updateDoc(userDocRef, {
        phoneNumber: normalizedPhone,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [PHONE HANDLER] Added phone number to user document:', normalizedPhone);
      return true;
    }
    
    // No phone number in user document and none provided
    console.log('⚠️ [PHONE HANDLER] No phone number in user document and none provided');
    return false;
  } catch (error) {
    console.error('❌ [PHONE HANDLER] Error ensuring phone number is stored:', error);
    return false;
  }
};

/**
 * Verify customer-user phone linking
 * This function checks if a user is properly linked to a customer record via phone number
 * 
 * @param userId User ID
 * @param phone Phone number (optional, will be retrieved from user document if not provided)
 * @returns Verification result
 */
export const verifyCustomerPhoneLinking = async (userId: string, phone?: string): Promise<any> => {
  console.log('🔍 [PHONE HANDLER] Verifying customer-user phone linking');
  console.log('🔍 [PHONE HANDLER] User ID:', userId);
  console.log('🔍 [PHONE HANDLER] Phone:', phone);
  
  // Use the debug function to get detailed diagnostics
  const diagnostics = await debugPhoneRegistration(userId, phone);
  
  // Return the diagnostic results
  return diagnostics;
};

/**
 * Fix customer phone linking issues
 * This function attempts to fix issues with customer-user phone linking
 * 
 * @param userId User ID
 * @param phone Phone number
 * @returns Success status and actions taken
 */
export const fixCustomerPhoneLinking = async (userId: string, phone?: string): Promise<any> => {
  if (!userId) {
    console.error('❌ [PHONE HANDLER] No user ID provided for fixing');
    return { success: false, reason: 'No user ID provided' };
  }
  
  console.log('🔍 [PHONE HANDLER] Attempting to fix customer-user phone linking');
  console.log('🔍 [PHONE HANDLER] User ID:', userId);
  
  try {
    // Step 1: Get user document to retrieve phone if not provided
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ [PHONE HANDLER] User document does not exist');
      return { success: false, reason: 'User document does not exist' };
    }
    
    const userData = userDoc.data();
    
    // Use provided phone or get from user document
    const phoneToUse = phone || userData.phoneNumber;
    
    if (!phoneToUse) {
      console.error('❌ [PHONE HANDLER] No phone number available to fix linking');
      return { success: false, reason: 'No phone number available' };
    }
    
    console.log('🔍 [PHONE HANDLER] Using phone number for fixing:', phoneToUse);
    
    // Step 2: Get diagnostic information
    const diagnostics = await debugPhoneRegistration(userId, phoneToUse);
    
    // Step 3: Determine what needs to be fixed
    const fixes = {
      userDocumentUpdated: false,
      customerRecordCreated: false,
      customerRecordLinked: false,
      success: false,
      diagnostics,
      updatedDiagnostics: null as any
    };
    
    // Fix 1: Ensure phone number is in user document
    if (!diagnostics.phoneInUserDoc) {
      console.log('🔧 [PHONE HANDLER] Fixing missing phone number in user document');
      
      await updateDoc(userDocRef, {
        phoneNumber: normalizePhoneNumber(phoneToUse),
        updatedAt: serverTimestamp()
      });
      
      fixes.userDocumentUpdated = true;
      console.log('✅ [PHONE HANDLER] Added phone number to user document');
    }
    
    // Fix 2: If no customer record exists, create one
    if (!diagnostics.customerByUserId && !diagnostics.customerByPhone) {
      console.log('🔧 [PHONE HANDLER] Creating missing customer record');
      
      // Create a new customer record
      const nameParts = userData.displayName?.split(' ') || ['User'];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const customerData = {
        firstName,
        lastName,
        email: userData.email || '',
        phone: normalizePhoneNumber(phoneToUse),
        userId: userId,
        joinDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const customersRef = collection(db, 'customers');
      const newCustomerRef = doc(customersRef);
      await setDoc(newCustomerRef, customerData);
      
      fixes.customerRecordCreated = true;
      console.log('✅ [PHONE HANDLER] Created new customer record:', newCustomerRef.id);
    }
    // Fix 3: If customer record exists by phone but is not linked to user
    else if (diagnostics.customerByPhone && diagnostics.customerByPhone.userId !== userId) {
      console.log('🔧 [PHONE HANDLER] Linking existing customer record to user');
      
      await updateDoc(doc(db, 'customers', diagnostics.customerByPhone.id), {
        userId: userId,
        updatedAt: serverTimestamp()
      });
      
      fixes.customerRecordLinked = true;
      console.log('✅ [PHONE HANDLER] Linked customer record to user');
    }
    
    // Run diagnostics again to verify fixes
    const updatedDiagnostics = await debugPhoneRegistration(userId, phoneToUse);
    fixes.success = updatedDiagnostics.success;
    fixes.updatedDiagnostics = updatedDiagnostics;
    
    console.log('🔍 [PHONE HANDLER] Fix results:', fixes);
    return fixes;
  } catch (error) {
    console.error('❌ [PHONE HANDLER] Error fixing customer-user phone linking:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Add this function to the window object for easy browser console testing
 */
if (typeof window !== 'undefined') {
  (window as any).ensurePhoneNumberStored = ensurePhoneNumberStored;
  (window as any).verifyCustomerPhoneLinking = verifyCustomerPhoneLinking;
  (window as any).fixCustomerPhoneLinking = fixCustomerPhoneLinking;
}