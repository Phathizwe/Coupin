/**
 * Enhanced customer lookup service with multiple format attempts
 */
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber, formatPhoneForDisplay } from '../utils/phoneUtils';

// Re-export the phone utilities for backward compatibility
export { normalizePhoneNumber, formatPhoneForDisplay };

/**
 * Customer record interface
 */
export interface CustomerRecord {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  businessId?: string;
  userId?: string;
  createdAt?: any;
}

/**
 * Find a customer by phone number, handling various formats
 * 
 * @param phone The phone number to search for
 * @returns The customer data if found, null otherwise
 */
export const findCustomerByPhone = async (phone: string): Promise<CustomerRecord | null> => {
  if (!phone) {
    console.log('❌ No phone number provided for customer lookup');
    return null;
  }
  
  console.log('🔍 Starting customer lookup for phone:', phone);
  
  // Try multiple phone number formats
  const phoneFormats = [
    normalizePhoneNumber(phone),           // +27832091122
    formatPhoneForDisplay(phone),          // 0832091122
    phone,                                 // Original format
    phone.replace(/\D/g, ''),             // Digits only
  ];
  
  console.log('📞 Trying phone formats:', phoneFormats);
  
  for (const phoneFormat of phoneFormats) {
    if (!phoneFormat) continue;
    
    try {
      console.log(`🔍 Searching for customer with phone: "${phoneFormat}"`);
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
        
        const customer: CustomerRecord = {
          id: doc.id,
          phone: customerData.phone,
          name: customerData.name,
          email: customerData.email,
          businessId: customerData.businessId,
          userId: customerData.userId,
          createdAt: customerData.createdAt,
        };
        
        console.log('✅ Customer found:', customer);
        return customer;
      } else {
        console.log(`ℹ️ No customer found with phone format: "${phoneFormat}"`);
      }
    } catch (error) {
      console.error(`❌ Error searching with phone format "${phoneFormat}":`, error);
      // Continue with next format
    }
  }
  
  console.log('❌ No customer found with any phone format');
  return null;
};

/**
 * Add a customer to a business
 * 
 * @param businessId The business ID
 * @param customerData The customer data
 * @returns The ID of the created customer
 */
export const addCustomerToBusiness = async (
  businessId: string,
  customerData: {
    phone: string;
    name?: string;
    email?: string;
  }
): Promise<string> => {
  // This is now implemented in the customerLinkingService
  // Re-export here for backward compatibility
  const { addCustomerToBusiness: addCustomer } = require('./customerLinkingService');
  return addCustomer(businessId, customerData);
};

/**
 * Enroll a customer in a program
 * 
 * @param customerId The customer ID
 * @param businessId The business ID
 * @param programId The program ID
 * @returns The ID of the created enrollment
 */
export const enrollCustomer = async (
  customerId: string,
  businessId: string,
  programId: string
): Promise<string> => {
  // This is now implemented in the customerLinkingService
  // Re-export here for backward compatibility
  const { enrollCustomer: enroll } = require('./customerLinkingService');
  return enroll(customerId, businessId, programId);
};