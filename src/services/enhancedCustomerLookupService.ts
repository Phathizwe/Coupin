import { 
  collection, 
  query, 
  where, 
  getDocs,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Normalize a phone number by removing all non-digit characters
 * Handles various formats like:
 * - 0832091122
 * - 083 209 1122
 * - +27832091122
 * - (083) 209 1122
 * - 0027832091122
 * 
 * @param phone The phone number to normalize
 * @returns The normalized phone number (digits only)
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

/**
 * Enhanced customer lookup with improved error handling and logging
 */
export const findCustomerByPhone = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      console.log('[findCustomerByPhone] Called with empty phone number');
      return null;
    }
    
    console.log(`[findCustomerByPhone] Searching for customer with phone: ${phoneNumber}`);
    
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      console.log('[findCustomerByPhone] Phone number normalized to empty string');
      return null;
    }
    
    console.log(`[findCustomerByPhone] Normalized phone: ${normalizedPhone}`);
    
    // Search in customers collection with normalized phone
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('phone', '==', normalizedPhone)
    );
    
    console.log(`[findCustomerByPhone] Querying customers collection`);
    const customersSnapshot = await getDocs(customersQuery);
    
    if (!customersSnapshot.empty) {
      const customerDoc = customersSnapshot.docs[0];
      const customerData = customerDoc.data();
      console.log(`[findCustomerByPhone] Found customer:`, {
        id: customerDoc.id,
        phone: customerData.phone,
        userId: customerData.userId,
        businessId: customerData.businessId
      });
      return {
        ...customerData,
        id: customerDoc.id,
        platformUser: !!customerData.userId,
        source: 'business'
      };
    }
    
    // Fallback: try with original phone format
    console.log(`[findCustomerByPhone] No match with normalized phone, trying original: ${phoneNumber}`);
    const fallbackQuery = query(
      customersRef,
      where('phone', '==', phoneNumber)
    );
    
    const fallbackSnapshot = await getDocs(fallbackQuery);
    
    if (!fallbackSnapshot.empty) {
      const customerDoc = fallbackSnapshot.docs[0];
      const customerData = customerDoc.data();
      console.log(`[findCustomerByPhone] Found customer with original format:`, {
        id: customerDoc.id,
        phone: customerData.phone,
        userId: customerData.userId
      });
      return {
        ...customerData,
        id: customerDoc.id,
        platformUser: !!customerData.userId,
        source: 'business'
      };
    }
    
    // Fallback: try with phone_normalized field
    console.log(`[findCustomerByPhone] Trying with phone_normalized field: ${normalizedPhone}`);
    const normalizedFieldQuery = query(
      customersRef,
      where('phone_normalized', '==', normalizedPhone)
    );
    
    const normalizedFieldSnapshot = await getDocs(normalizedFieldQuery);
    
    if (!normalizedFieldSnapshot.empty) {
      const customerDoc = normalizedFieldSnapshot.docs[0];
      const customerData = customerDoc.data();
      console.log(`[findCustomerByPhone] Found customer with phone_normalized field:`, {
        id: customerDoc.id,
        phone: customerData.phone,
        phone_normalized: customerData.phone_normalized,
        userId: customerData.userId
      });
      return {
        ...customerData,
        id: customerDoc.id,
        platformUser: !!customerData.userId,
        source: 'business'
      };
    }
    
    // Fallback: try with South African number format conversion
    // Convert +27 format to 0 format or vice versa
    let alternativePhone = '';
    if (normalizedPhone.startsWith('27')) {
      alternativePhone = '0' + normalizedPhone.substring(2);
      console.log(`[findCustomerByPhone] Trying South African format conversion: 27xxx → 0xxx: ${alternativePhone}`);
    } else if (normalizedPhone.startsWith('0')) {
      alternativePhone = '27' + normalizedPhone.substring(1);
      console.log(`[findCustomerByPhone] Trying South African format conversion: 0xxx → 27xxx: ${alternativePhone}`);
    }
    
    if (alternativePhone) {
      const alternativeQuery = query(
        customersRef,
        where('phone', '==', alternativePhone)
      );
      
      const alternativeSnapshot = await getDocs(alternativeQuery);
      
      if (!alternativeSnapshot.empty) {
        const customerDoc = alternativeSnapshot.docs[0];
        const customerData = customerDoc.data();
        console.log(`[findCustomerByPhone] Found customer with alternative phone format:`, {
          id: customerDoc.id,
          phone: customerData.phone,
          userId: customerData.userId
        });
        return {
          ...customerData,
          id: customerDoc.id,
          platformUser: !!customerData.userId,
          source: 'business'
        };
      }
      
      // Also try the alternative format with the phone_normalized field
      const alternativeNormalizedQuery = query(
        customersRef,
        where('phone_normalized', '==', alternativePhone)
      );
      
      const alternativeNormalizedSnapshot = await getDocs(alternativeNormalizedQuery);
      
      if (!alternativeNormalizedSnapshot.empty) {
        const customerDoc = alternativeNormalizedSnapshot.docs[0];
        const customerData = customerDoc.data();
        console.log(`[findCustomerByPhone] Found customer with alternative normalized phone:`, {
          id: customerDoc.id,
          phone: customerData.phone,
          phone_normalized: customerData.phone_normalized,
          userId: customerData.userId
        });
        return {
          ...customerData,
          id: customerDoc.id,
          platformUser: !!customerData.userId,
          source: 'business'
        };
      }
    }
    
    // Last resort: manual comparison with all customers (limited to 100 for performance)
    console.log(`[findCustomerByPhone] Trying manual comparison with limited customer set`);
    const limitedCustomersQuery = query(customersRef);
    const limitedCustomersSnapshot = await getDocs(limitedCustomersQuery);
    
    if (!limitedCustomersSnapshot.empty) {
      let matchedCustomer: QueryDocumentSnapshot | null = null;
      
      // Check each customer for a phone number match
      for (const doc of limitedCustomersSnapshot.docs) {
        const data = doc.data();
        
        // Skip if no phone data
        if (!data.phone) continue;
        
        const customerNormalizedPhone = normalizePhoneNumber(data.phone);
        
        // Direct match after normalization
        if (customerNormalizedPhone === normalizedPhone) {
          matchedCustomer = doc;
          console.log(`[findCustomerByPhone] Found match through manual comparison: ${data.phone}`);
          break;
        }
        
        // Check South African number format variations
        if (customerNormalizedPhone.startsWith('27') && normalizedPhone.startsWith('0')) {
          if (customerNormalizedPhone.substring(2) === normalizedPhone.substring(1)) {
            matchedCustomer = doc;
            console.log(`[findCustomerByPhone] Found match through SA format comparison: ${data.phone}`);
            break;
          }
        } else if (customerNormalizedPhone.startsWith('0') && normalizedPhone.startsWith('27')) {
          if (customerNormalizedPhone.substring(1) === normalizedPhone.substring(2)) {
            matchedCustomer = doc;
            console.log(`[findCustomerByPhone] Found match through SA format comparison: ${data.phone}`);
            break;
          }
        }
      }
      
      if (matchedCustomer) {
        const customerData = matchedCustomer.data();
        return {
          ...customerData,
          id: matchedCustomer.id,
          platformUser: !!customerData.userId,
          source: 'business'
        };
      }
    }
    
    console.log(`[findCustomerByPhone] No customer found for phone: ${phoneNumber}`);
    return null;
  } catch (error) {
    console.error('[findCustomerByPhone] Error searching for customer:', error);
    throw error;
  }
};

/**
 * Check if two phone numbers match after normalization
 * Handles different formats including country code variations
 */
export const phoneNumbersMatch = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  // Direct match after normalization
  if (normalized1 === normalized2) return true;
  
  // Handle South African number formats: +27 vs 0
  if (normalized1.startsWith('27') && normalized2.startsWith('0')) {
    return normalized1.substring(2) === normalized2.substring(1);
  }
  
  if (normalized2.startsWith('27') && normalized1.startsWith('0')) {
    return normalized2.substring(2) === normalized1.substring(1);
  }
  
  return false;
};