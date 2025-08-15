import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  getFirestore,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Enhanced service for linking customer accounts with user logins based on phone number
 * with improved handling of different phone number formats
 */
export class EnhancedCustomerAccountLinkingService {
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
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  }

  /**
   * Check if two phone numbers match after normalization
   * 
   * @param phone1 First phone number
   * @param phone2 Second phone number
   * @returns True if the phone numbers match after normalization
   */
  phoneNumbersMatch(phone1: string, phone2: string): boolean {
    if (!phone1 || !phone2) return false;
    
    const normalized1 = this.normalizePhoneNumber(phone1);
    const normalized2 = this.normalizePhoneNumber(phone2);
    
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
  }

  /**
   * Find a customer by phone number, handling various formats
   * This implementation does a more thorough search to handle different formats
   * 
   * @param phone The phone number to search for
   * @returns The customer data if found, null otherwise
   */
  async findCustomerByPhone(phone: string): Promise<any | null> {
    try {
      if (!phone) {
        console.log('findCustomerByPhone called with empty phone number');
        return null;
      }
      
      // Normalize the input phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);
      
      if (!normalizedPhone) {
        console.log('Phone number normalized to empty string');
        return null;
      }
      
      console.log(`Finding customer with normalized phone: ${normalizedPhone}`);
      
      // Try multiple approaches to find the customer
      
      // 1. Try with the normalized_phone field first
      const customersRef = collection(db, 'customers');
      let customer = await this.tryFindByField(customersRef, 'phone_normalized', normalizedPhone);
      if (customer) return customer;
      
      // 2. Try with the phone field (exact match)
      customer = await this.tryFindByField(customersRef, 'phone', phone);
      if (customer) return customer;
      
      // 3. Try with the normalized phone as the phone field
      customer = await this.tryFindByField(customersRef, 'phone', normalizedPhone);
      if (customer) return customer;
      
      // 4. Try with the original phone format as the phone_normalized field
      customer = await this.tryFindByField(customersRef, 'phone_normalized', phone);
      if (customer) return customer;
      
      // 5. Get all customers and compare phone numbers manually
      // This is more expensive but handles all edge cases
      const allCustomersQuery = query(customersRef);
      const allCustomersSnapshot = await getDocs(allCustomersQuery);
      
      if (!allCustomersSnapshot.empty) {
        console.log(`Checking ${allCustomersSnapshot.size} customers for phone number match`);
        
        for (const doc of allCustomersSnapshot.docs) {
          const customerData = doc.data() as DocumentData;
          
          // Try matching against the phone field
          if (customerData.phone && this.phoneNumbersMatch(customerData.phone, phone)) {
            console.log(`Found customer with matching phone: ${customerData.phone} matches ${phone}`);
            return {
              id: doc.id,
              ...Object.assign({}, customerData)
            };
          }
          
          // Try matching against the phone_normalized field
          if (customerData.phone_normalized && this.phoneNumbersMatch(customerData.phone_normalized, phone)) {
            console.log(`Found customer with matching normalized phone: ${customerData.phone_normalized} matches ${phone}`);
            return {
              id: doc.id,
              ...Object.assign({}, customerData)
            };
          }
        }
      }
      
      console.log(`No customer found with phone ${phone} after exhaustive search`);
      return null;
    } catch (error) {
      console.error('Error finding customer by phone:', error);
      throw error;
    }
  }

  /**
   * Helper method to try finding a customer by a specific field
   * 
   * @param collectionRef The collection reference
   * @param field The field to search on
   * @param value The value to search for
   * @returns The customer data if found, null otherwise
   */
  private async tryFindByField(collectionRef: any, field: string, value: string): Promise<any | null> {
    try {
      console.log(`Trying to find customer with ${field} = ${value}`);
      
      const fieldQuery = query(
        collectionRef,
        where(field, '==', value)
      );
      
      const snapshot = await getDocs(fieldQuery);
      
      if (!snapshot.empty) {
        console.log(`Found customer with ${field} = ${value}`);
        const customerData = snapshot.docs[0].data() as DocumentData;
        return {
          id: snapshot.docs[0].id,
          ...Object.assign({}, customerData)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding customer by ${field}:`, error);
      return null;
    }
  }

  /**
   * Link a user account to a customer record
   * 
   * @param userId The user ID to link
   * @param customerId The customer ID to link to
   * @returns True if successful, false otherwise
   */
  async linkUserToCustomer(userId: string, customerId: string): Promise<boolean> {
    try {
      // Check if the customer exists
      const customerRef = doc(db, 'customers', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        console.error(`Customer ${customerId} does not exist`);
        return false;
      }
      
      // Check if the customer is already linked to a different user
      const customerData = customerDoc.data();
      if (customerData && customerData.userId && customerData.userId !== userId) {
        console.warn(`Customer ${customerId} is already linked to user ${customerData.userId}`);
        // You may want to handle this case differently depending on your requirements
      }
      
      // Update the customer record with the user ID
      await updateDoc(customerRef, {
        userId: userId,
        updatedAt: serverTimestamp()
      });
      
      // Also update the user record with the linked customer ID
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        linkedCustomerId: customerId,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Linked user ${userId} to customer ${customerId}`);
      return true;
    } catch (error) {
      console.error('Error linking user to customer:', error);
      return false;
    }
  }

  /**
   * Process a new user registration and link to existing customer if found
   * 
   * @param userId The user ID
   * @param phone The phone number
   * @param email The email address
   * @param name The user's name
   * @returns The linked customer ID if found and linked, null otherwise
   */
  async processUserRegistration(userId: string, phone: string, email: string, name: string): Promise<string | null> {
    try {
      if (!phone) {
        console.log('No phone number provided for user registration');
        return null;
      }
      
      // Find customer by phone number
      const customer = await this.findCustomerByPhone(phone);
      
      if (customer) {
        console.log(`Found existing customer with phone ${phone}: ${customer.id}`);
        
        // Link the user to the customer
        const linked = await this.linkUserToCustomer(userId, customer.id);
        
        if (linked) {
          return customer.id;
        }
      }
      
      // No customer found or linking failed
      return null;
    } catch (error) {
      console.error('Error processing user registration:', error);
      return null;
    }
  }

  /**
   * Update a user's phone number and link to any existing customer records
   * 
   * @param userId The user ID
   * @param phone The new phone number
   * @returns The linked customer ID if found and linked, null otherwise
   */
  async updateUserPhoneAndLinkCustomer(userId: string, phone: string): Promise<string | null> {
    try {
      if (!userId || !phone) {
        console.log('Missing userId or phone number');
        return null;
      }
      
      // Normalize the phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);
      
      // Update the user's phone number
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: phone,
        phoneNumber_normalized: normalizedPhone,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Updated phone number for user ${userId}: ${phone} (normalized: ${normalizedPhone})`);
      
      // Find and link to existing customer
      const customer = await this.findCustomerByPhone(phone);
      
      if (customer) {
        console.log(`Found existing customer with phone ${phone}: ${customer.id}`);
        
        // Link the user to the customer
        const linked = await this.linkUserToCustomer(userId, customer.id);
        
        if (linked) {
          return customer.id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user phone and linking customer:', error);
      return null;
    }
  }

  /**
   * Debug method to log all customers and their phone numbers
   * Useful for troubleshooting phone number matching issues
   */
  async debugAllCustomerPhones(): Promise<void> {
    try {
      const customersRef = collection(db, 'customers');
      const snapshot = await getDocs(customersRef);
      
      console.log(`Found ${snapshot.size} customers`);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Customer ${doc.id}:`);
        console.log(`  - Phone: ${data.phone}`);
        console.log(`  - Phone Normalized: ${data.phone_normalized}`);
        console.log(`  - User ID: ${data.userId || 'Not linked'}`);
      });
    } catch (error) {
      console.error('Error debugging customer phones:', error);
    }
  }
}

// Export a singleton instance
export const enhancedCustomerAccountLinkingService = new EnhancedCustomerAccountLinkingService();