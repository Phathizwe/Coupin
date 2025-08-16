/**
 * Comprehensive customer linking service
 * Handles all customer-user linking operations
 */
import { doc, getDoc, collection, query, where, getDocs, runTransaction, limit, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from '../utils/phoneUtils';

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
  updatedAt?: any;
}

/**
 * Find a customer by user ID
 * 
 * @param userId The user ID to search for
 * @returns The customer data if found, null otherwise
 */
export const findCustomerByUserId = async (userId: string): Promise<CustomerRecord | null> => {
  if (!userId) {
    console.log('❌ No user ID provided for customer lookup');
    return null;
  }
  
  console.log('🔍 Looking for customer with userId:', userId);
  
  try {
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef,
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const customerData = doc.data();
      
      const customer: CustomerRecord = {
        id: doc.id,
        phone: customerData.phone || '',
        name: customerData.name,
        email: customerData.email,
        businessId: customerData.businessId,
        userId: customerData.userId,
        createdAt: customerData.createdAt,
        updatedAt: customerData.updatedAt
      };
      
      console.log('✅ Found customer by userId:', customer);
      return customer;
    } else {
      console.log('❌ No customer found with userId:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error finding customer by userId:', error);
    return null;
  }
};

/**
 * Find a customer by phone number
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
  const normalizedPhone = normalizePhoneNumber(phone);
  const phoneFormats = [
    normalizedPhone,                      // +27832091122
    phone,                                // Original format
    phone.replace(/\D/g, ''),             // Digits only
    `0${normalizedPhone.substring(3)}`,   // 0832091122
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
          updatedAt: customerData.updatedAt
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
 * Link a customer record to a user account using a Firestore transaction
 * 
 * @param customerId The ID of the customer to link
 * @param userId The ID of the user to link to
 * @returns Promise that resolves when the transaction is complete
 */
export const linkCustomerToUser = async (customerId: string, userId: string): Promise<void> => {
  console.log('🔗 Starting customer-user linking transaction...', { customerId, userId });
  
  try {
    await runTransaction(db, async (transaction) => {
      // Get customer document reference
      const customerRef = doc(db, 'customers', customerId);
      
      // Read current customer data
      const customerDoc = await transaction.get(customerRef);
      
      if (!customerDoc.exists()) {
        throw new Error(`Customer document ${customerId} does not exist`);
      }
      
      const customerData = customerDoc.data();
      console.log('📋 Current customer data:', customerData);
      
      // Check if already linked to different user
      if (customerData.userId && customerData.userId !== userId) {
        console.warn('⚠️ Customer already linked to different user:', customerData.userId);
        // Optionally throw error or handle as needed
      }
      
      // Update customer record with user ID
      const updateData = {
        userId: userId,
        linkedAt: new Date(),
        updatedAt: new Date()
      };
      
      transaction.update(customerRef, updateData);
      console.log('✅ Customer record updated in transaction:', updateData);
    });
    
    console.log('🎉 Customer-user linking transaction completed successfully');
  } catch (error: any) {
    console.error('❌ Customer-user linking transaction failed:', error);
    throw new Error(`Failed to link customer ${customerId} to user ${userId}: ${error?.message || 'Unknown error'}`);
  }
};

/**
 * Link a user to a customer record
 * Wrapper for linkCustomerToUser with additional user record update
 * 
 * @param userId The user ID to link
 * @param customerId The customer ID to link to
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const linkUserToCustomer = async (userId: string, customerId: string): Promise<boolean> => {
  try {
    // Link customer to user
    await linkCustomerToUser(customerId, userId);
    
    // Update user record with customer ID
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      linkedCustomerId: customerId,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log('✅ User record updated with linkedCustomerId:', customerId);
    return true;
  } catch (error) {
    console.error('❌ Error linking user to customer:', error);
    return false;
  }
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
    userId?: string;
  }
): Promise<string> => {
  try {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(customerData.phone);
    
    // Check if customer already exists with this phone
    const existingCustomer = await findCustomerByPhone(normalizedPhone);
    if (existingCustomer) {
      console.log('✅ Customer already exists, updating with business ID:', existingCustomer.id);
      
      // Update existing customer with business ID
      const customerRef = doc(db, 'customers', existingCustomer.id);
      await setDoc(customerRef, {
        businessId,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      return existingCustomer.id;
    }
    
    // Create new customer
    const customersRef = collection(db, 'customers');
    const newCustomerRef = doc(customersRef);
    
    const newCustomer = {
      id: newCustomerRef.id,
      phone: normalizedPhone,
      name: customerData.name || null,
      email: customerData.email || null,
      businessId,
      userId: customerData.userId || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(newCustomerRef, newCustomer);
    console.log('✅ Created new customer record:', newCustomerRef.id);
    
    return newCustomerRef.id;
  } catch (error) {
    console.error('❌ Error adding customer to business:', error);
    throw error;
  }
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
  try {
    // Create enrollment record
    const enrollmentsRef = collection(db, 'enrollments');
    const newEnrollmentRef = doc(enrollmentsRef);
    
    const enrollment = {
      id: newEnrollmentRef.id,
      customerId,
      businessId,
      programId,
      enrollmentDate: Timestamp.now(),
      status: 'active',
      source: 'manual',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(newEnrollmentRef, enrollment);
    console.log('✅ Created enrollment record:', newEnrollmentRef.id);
    
    return newEnrollmentRef.id;
  } catch (error) {
    console.error('❌ Error enrolling customer:', error);
    throw error;
  }
};