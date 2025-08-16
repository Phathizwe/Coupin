/**
 * Phone registration service
 * Handles phone number processing during user registration
 */
import { doc, setDoc, updateDoc, collection, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { normalizePhoneNumber } from '../../../utils/phoneUtils';

/**
 * Process phone number during registration
 * 
 * @param userId User ID
 * @param phone Phone number (if provided)
 * @param userData User data object to update with phone
 * @returns Updated user data with phone number
 */
export const processPhoneNumber = (userId: string, phone: string | undefined, userData: any): any => {
  console.log('🔍 [PHONE REGISTRATION] Processing phone number for user:', userId);
  console.log('🔍 [PHONE REGISTRATION] Original phone:', phone);
  
  if (!phone) {
    console.log('🔍 [PHONE REGISTRATION] No phone number provided');
    return userData;
  }
  
  // Normalize the phone number
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('🔍 [PHONE REGISTRATION] Normalized phone:', normalizedPhone);
  
  // Add phone number to user data
  userData.phoneNumber = normalizedPhone;
  console.log('🔍 [PHONE REGISTRATION] Added phone to userData:', userData.phoneNumber);
  
  return userData;
};

/**
 * Find customer by phone number
 * 
 * @param phone Phone number to search for
 * @returns Customer record if found, null otherwise
 */
export const findCustomerByPhone = async (phone: string): Promise<any | null> => {
  if (!phone) {
    console.log('❌ [PHONE REGISTRATION] No phone number provided for customer lookup');
    return null;
  }
  
  console.log('🔍 [PHONE REGISTRATION] Looking for customer with phone:', phone);
  
  // Try multiple phone number formats
  const normalizedPhone = normalizePhoneNumber(phone);
  const phoneFormats = [
    normalizedPhone,                      // +27832091122
    phone,                                // Original format
    phone.replace(/\D/g, ''),             // Digits only
    `0${normalizedPhone.substring(3)}`,   // 0832091122
  ];
  
  console.log('📞 [PHONE REGISTRATION] Trying phone formats:', phoneFormats);
  
  for (const phoneFormat of phoneFormats) {
    if (!phoneFormat) continue;
    
    try {
      console.log(`🔍 [PHONE REGISTRATION] Searching for customer with phone: "${phoneFormat}"`);
      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef,
        where('phone', '==', phoneFormat),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const customerData = doc.data();
        
        const customer = {
          id: doc.id,
          ...customerData
        };
        
        console.log('✅ [PHONE REGISTRATION] Customer found:', customer);
        return customer;
      } else {
        console.log(`ℹ️ [PHONE REGISTRATION] No customer found with phone format: "${phoneFormat}"`);
      }
    } catch (error) {
      console.error(`❌ [PHONE REGISTRATION] Error searching with phone format "${phoneFormat}":`, error);
      // Continue with next format
    }
  }
  
  console.log('❌ [PHONE REGISTRATION] No customer found with any phone format');
  return null;
};

/**
 * Create a new customer record
 * 
 * @param userId User ID
 * @param email Email address
 * @param name Full name
 * @param phone Phone number
 * @returns Customer ID
 */
export const createCustomerRecord = async (
  userId: string,
  email: string,
  name: string,
  phone: string
): Promise<string> => {
  console.log('🔍 [PHONE REGISTRATION] Creating new customer record...');
  
  // Split name into first and last name
  const nameParts = name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Create a customer record
  const customerData = {
    firstName,
    lastName,
    email: email,
    phone: phone,
    userId: userId,
    joinDate: serverTimestamp(),
    createdAt: serverTimestamp()
  };
  
  console.log('🔍 [PHONE REGISTRATION] Customer data to save:', customerData);
  
  try {
    const customersRef = collection(db, 'customers');
    const newCustomerRef = doc(customersRef);
    await setDoc(newCustomerRef, customerData);
    
    console.log('✅ [PHONE REGISTRATION] Created new customer record:', newCustomerRef.id);
    return newCustomerRef.id;
  } catch (error) {
    console.error('❌ [PHONE REGISTRATION] Error creating customer record:', error);
    throw error;
  }
};

/**
 * Link user to existing customer
 * 
 * @param userId User ID
 * @param customerId Customer ID
 */
export const linkUserToExistingCustomer = async (userId: string, customerId: string): Promise<void> => {
  console.log('🔍 [PHONE REGISTRATION] Linking user to existing customer:', customerId);
  
  try {
    await updateDoc(doc(db, 'customers', customerId), {
      userId: userId,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ [PHONE REGISTRATION] Linked user to existing customer');
  } catch (error) {
    console.error('❌ [PHONE REGISTRATION] Error linking user to customer:', error);
    throw error;
  }
};

/**
 * Handle customer record creation or linking during registration
 * 
 * @param userId User ID
 * @param email Email address
 * @param name Full name
 * @param phone Phone number
 */
export const handleCustomerRecord = async (
  userId: string,
  email: string,
  name: string,
  phone: string
): Promise<void> => {
  console.log('🔍 [PHONE REGISTRATION] Handling customer record for user:', userId);
  console.log('🔍 [PHONE REGISTRATION] Phone:', phone);
  
  try {
    // Check if a customer with this phone already exists
    const existingCustomer = await findCustomerByPhone(phone);
    
    if (existingCustomer) {
      console.log('🔍 [PHONE REGISTRATION] Found existing customer with phone:', existingCustomer.id);
      
      // Link user to existing customer if not already linked
      if (!existingCustomer.userId) {
        await linkUserToExistingCustomer(userId, existingCustomer.id);
      } else if (existingCustomer.userId !== userId) {
        console.log('⚠️ [PHONE REGISTRATION] Customer already linked to different user:', existingCustomer.userId);
        // Could handle this case differently if needed
      }
    } else {
      console.log('🔍 [PHONE REGISTRATION] No existing customer found, creating new customer record');
      await createCustomerRecord(userId, email, name, phone);
    }
  } catch (error) {
    console.error('❌ [PHONE REGISTRATION] Error handling customer record:', error);
    throw error;
  }
};