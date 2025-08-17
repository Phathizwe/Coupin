/**
 * Customer service
 * Handles customer record creation and lookup
 */
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Customer } from '../types';
import Papa from 'papaparse';
import { normalizePhoneNumber } from '../utils/phoneUtils';

// Get customers for a business with pagination
export const getCustomers = async (
  businessId: string, 
  lastVisible: any = null, 
  pageSize: number = 20,
  searchTerm: string = '',
  filterTags: string[] = []
) => {
  try {
    console.log('Fetching customers for business ID:', businessId);
    
    // Use a simpler query without orderBy to avoid index issues
    let customersQuery = query(
      collection(db, 'customers'),
      where('businessId', '==', businessId),
      limit(pageSize)
    );

    // Apply pagination if we have a last visible document
    if (lastVisible) {
      customersQuery = query(
        customersQuery,
        startAfter(lastVisible)
      );
    }

    const snapshot = await getDocs(customersQuery);
    console.log('Customers query returned:', snapshot.size, 'documents');
    
    const customers: Customer[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as Customer;
      
      // Apply client-side filtering for search term if provided
      if (searchTerm && !(
        data.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (data.phone && data.phone.includes(searchTerm))
      )) {
        return;
      }
      
      // Apply tag filtering if provided
      if (filterTags.length > 0 && (!data.tags || !filterTags.every(tag => data.tags?.includes(tag)))) {
        return;
      }
      
      customers.push({
        ...data,
        id: doc.id
      });
    });
    
    // Sort customers by lastName client-side instead of using orderBy
    customers.sort((a, b) => {
      const lastNameA = a.lastName || '';
      const lastNameB = b.lastName || '';
      return lastNameA.localeCompare(lastNameB);
    });
    
    console.log('Returning', customers.length, 'customers after filtering');
    
    // Return the customers and the last visible document for pagination
    return {
      customers,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

// Get a single customer by ID
export const getCustomer = async (customerId: string) => {
  try {
    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: docSnap.id
      } as Customer;
    } else {
      throw new Error('Customer not found');
    }
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

// Add a new customer
export const addCustomer = async (customer: Omit<Customer, 'id'>) => {
  try {
    const newCustomerRef = doc(collection(db, 'customers'));
    await setDoc(newCustomerRef, {
      ...customer,
      joinDate: customer.joinDate || serverTimestamp(),
      totalSpent: customer.totalSpent || 0,
      totalVisits: customer.totalVisits || 0,
      loyaltyPoints: customer.loyaltyPoints || 0
    });
    
    return {
      ...customer,
      id: newCustomerRef.id
    };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

// Update an existing customer
export const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Delete a customer
export const deleteCustomer = async (customerId: string) => {
  try {
    const customerRef = doc(db, 'customers', customerId);
    await deleteDoc(customerRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Define an interface for CSV row data
interface CustomerCSVRow {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthdate?: string;
  totalSpent?: string;
  totalVisits?: string;
  notes?: string;
  tags?: string;
  loyaltyPoints?: string;
  [key: string]: unknown;
}

// Import customers from CSV
export const importCustomersFromCSV = async (businessId: string, csvFile: File) => {
  return new Promise<{ success: number; failed: number; errors: any[] }>((resolve, reject) => {
    Papa.parse<unknown>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const batch = writeBatch(db);
          let successCount = 0;
          let failedCount = 0;
          const errors: any[] = [];
          
          for (const rowData of results.data) {
            try {
              // Type assertion with validation
              const row = rowData as Record<string, unknown>;
              
              // Validate required fields
              if (
                typeof row.firstName !== 'string' || !row.firstName ||
                typeof row.lastName !== 'string' || !row.lastName ||
                typeof row.email !== 'string' || !row.email
              ) {
                throw new Error('Missing required fields (firstName, lastName, or email)');
              }
              
              // Create customer object
              const customer: Omit<Customer, 'id'> = {
                businessId,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                phone: typeof row.phone === 'string' ? row.phone : '',
                birthdate: typeof row.birthdate === 'string' && row.birthdate ? new Date(row.birthdate) : null,
                joinDate: serverTimestamp(),
                totalSpent: typeof row.totalSpent === 'string' ? parseFloat(row.totalSpent) || 0 : 0,
                totalVisits: typeof row.totalVisits === 'string' ? parseInt(row.totalVisits) || 0 : 0,
                notes: typeof row.notes === 'string' ? row.notes : '',
                tags: typeof row.tags === 'string' && row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
                loyaltyPoints: typeof row.loyaltyPoints === 'string' ? parseInt(row.loyaltyPoints) || 0 : 0
              };
              
              // Add to batch
              const newCustomerRef = doc(collection(db, 'customers'));
              batch.set(newCustomerRef, customer);
              successCount++;
            } catch (error) {
              failedCount++;
              errors.push({
                row: rowData,
                error: (error as Error).message
              });
            }
          }
          
          // Commit the batch
          await batch.commit();
          
          resolve({
            success: successCount,
            failed: failedCount,
            errors
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Create a customer record
 * 
 * @param userId The user ID to associate with the customer
 * @param customerData The customer data
 * @returns The ID of the created customer
 */
export const createCustomerRecord = async (
  userId: string,
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userId: string;
  }
) => {
  console.log('🔍 [CUSTOMER DEBUG] Creating customer record...');
  console.log('🔍 [CUSTOMER DEBUG] User ID:', userId);
  console.log('🔍 [CUSTOMER DEBUG] Customer data:', customerData);
  
  try {
    const customersRef = collection(db, 'customers');
    const newCustomerRef = doc(customersRef);
    const customerRecord = {
      ...customerData,
      joinDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('🔍 [CUSTOMER DEBUG] Final customer record:', customerRecord);
    console.log('🔍 [CUSTOMER DEBUG] Document ID:', newCustomerRef.id);
    
    await setDoc(newCustomerRef, customerRecord);
    console.log('🔍 [CUSTOMER DEBUG] Customer document saved successfully');
    
    // Verify the save worked
    const savedDoc = await getDocs(query(customersRef, where('userId', '==', userId), limit(1)));
    if (!savedDoc.empty) {
      console.log('🔍 [CUSTOMER DEBUG] Verification successful:', savedDoc.docs[0].data());
      return { id: newCustomerRef.id, ...customerRecord };
    } else {
      throw new Error('Customer document not found after creation');
    }
  } catch (error) {
    console.error('🚨 [CUSTOMER ERROR] Failed to create customer record:', error);
    throw error;
  }
};

/**
 * Find a customer by user ID
 * 
 * @param userId The user ID to search for
 * @returns The customer data if found, null otherwise
 */
export const findCustomerByUserId = async (userId: string) => {
  console.log('🔍 [LOOKUP DEBUG] Looking for customer with userId:', userId);
  
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    console.log('🔍 [LOOKUP DEBUG] Query results:', querySnapshot.size, 'documents');
    
    if (!querySnapshot.empty) {
      const customerDoc = querySnapshot.docs[0];
      const customerData = { id: customerDoc.id, ...customerDoc.data() };
      console.log('🔍 [LOOKUP DEBUG] Found customer:', customerData);
      return customerData;
    }
    
    console.log('🔍 [LOOKUP DEBUG] No customer found for userId:', userId);
    return null;
  } catch (error) {
    console.error('🚨 [LOOKUP ERROR] Error finding customer:', error);
    throw error;
  }
};

/**
 * Find a customer by phone number
 * 
 * @param phone The phone number to search for
 * @returns The customer data if found, null otherwise
 */
export const findCustomerByPhone = async (phone: string) => {
  console.log('🔍 [LOOKUP DEBUG] Looking for customer with phone:', phone);
  
  if (!phone) {
    console.log('❌ [LOOKUP DEBUG] No phone number provided');
    return null;
  }
  
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('phone', '==', normalizedPhone));
    const querySnapshot = await getDocs(q);
    
    console.log('🔍 [LOOKUP DEBUG] Query results:', querySnapshot.size, 'documents');
    
    if (!querySnapshot.empty) {
      const customerDoc = querySnapshot.docs[0];
      const customerData = { id: customerDoc.id, ...customerDoc.data() };
      console.log('🔍 [LOOKUP DEBUG] Found customer:', customerData);
      return customerData;
    }
    
    console.log('🔍 [LOOKUP DEBUG] No customer found for phone:', phone);
    return null;
  } catch (error) {
    console.error('🚨 [LOOKUP ERROR] Error finding customer:', error);
    throw error;
  }
};