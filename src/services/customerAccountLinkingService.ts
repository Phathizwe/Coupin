import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  setDoc,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service for linking customer accounts with user logins based on phone number
 */
export class CustomerAccountLinkingService {
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
   * Find a customer by phone number, handling various formats
   * 
   * @param phone The phone number to search for
   * @returns The customer data if found, null otherwise
   */
  async findCustomerByPhone(phone: string): Promise<any | null> {
    try {
      if (!phone) {
        console.log('[CustomerAccountLinkingService] findCustomerByPhone called with empty phone number');
        return null;
      }
      
      // Normalize the input phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);
      
      if (!normalizedPhone) {
        console.log('[CustomerAccountLinkingService] Phone number normalized to empty string');
        return null;
      }
      
      console.log(`[CustomerAccountLinkingService] Finding customer with normalized phone: ${normalizedPhone}`);
      
      // Try with the normalized phone number
      const customersRef = collection(db, 'customers');
      const phoneQuery = query(
        customersRef,
        where('phone', '==', normalizedPhone)
      );
      
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        console.log(`[CustomerAccountLinkingService] Found customer with phone ${normalizedPhone}`);
        const customerData = phoneSnapshot.docs[0].data();
        return {
          ...customerData,
          id: phoneSnapshot.docs[0].id
        };
      }
      
      // Try with the original phone format as a fallback
      const originalPhoneQuery = query(
        customersRef,
        where('phone', '==', phone)
      );
      
      const originalPhoneSnapshot = await getDocs(originalPhoneQuery);
      
      if (!originalPhoneSnapshot.empty) {
        console.log(`[CustomerAccountLinkingService] Found customer with original phone format ${phone}`);
        const customerData = originalPhoneSnapshot.docs[0].data();
        return {
          ...customerData,
          id: originalPhoneSnapshot.docs[0].id
        };
      }
      
      // Try with normalized_phone field if it exists
      const normalizedPhoneQuery = query(
        customersRef,
        where('phone_normalized', '==', normalizedPhone)
      );
      
      const normalizedPhoneSnapshot = await getDocs(normalizedPhoneQuery);
      
      if (!normalizedPhoneSnapshot.empty) {
        console.log(`[CustomerAccountLinkingService] Found customer with normalized_phone ${normalizedPhone}`);
        const customerData = normalizedPhoneSnapshot.docs[0].data();
        return {
          ...customerData,
          id: normalizedPhoneSnapshot.docs[0].id
        };
    }
      
      console.log(`[CustomerAccountLinkingService] No customer found with phone ${phone}`);
      return null;
    } catch (error) {
      console.error('[CustomerAccountLinkingService] Error finding customer by phone:', error);
      throw error;
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
      console.log(`[CustomerAccountLinkingService] Linking user ${userId} to customer ${customerId}`);
      
      return await runTransaction(db, async (transaction) => {
        // Check if the customer exists
        const customerRef = doc(db, 'customers', customerId);
        const customerDoc = await transaction.get(customerRef);
        
        if (!customerDoc.exists()) {
          console.error(`[CustomerAccountLinkingService] Customer ${customerId} does not exist`);
          return false;
}

        // Check if the customer is already linked to a different user
        const customerData = customerDoc.data();
        if (customerData.userId && customerData.userId !== userId) {
          console.warn(`[CustomerAccountLinkingService] Customer ${customerId} is already linked to user ${customerData.userId}`);
          return false;
        }
        
        // Update the customer record with the user ID
        transaction.update(customerRef, {
          userId: userId,
          updatedAt: serverTimestamp()
        });
        
        // Also update the user record with the linked customer ID
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists()) {
          transaction.update(userRef, {
            linkedCustomerId: customerId,
            updatedAt: serverTimestamp()
          });
        }
        
        console.log(`[CustomerAccountLinkingService] Successfully linked user ${userId} to customer ${customerId}`);
        return true;
      });
    } catch (error) {
      console.error('[CustomerAccountLinkingService] Error linking user to customer:', error);
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
        console.log('[CustomerAccountLinkingService] No phone number provided for user registration');
        return null;
      }
      
      console.log(`[CustomerAccountLinkingService] Processing registration for user ${userId} with phone ${phone}`);
      
      // Use transaction for atomicity
      return await runTransaction(db, async (transaction) => {
        // Find customer by phone number
        const customer = await this.findCustomerByPhone(phone);
        
        if (customer) {
          console.log(`[CustomerAccountLinkingService] Found existing customer with phone ${phone}: ${customer.id}`);
          
          // Check if customer already has a userId
          if (customer.userId) {
            console.log(`[CustomerAccountLinkingService] Customer already has userId: ${customer.userId}`);
            
            if (customer.userId === userId) {
              console.log('[CustomerAccountLinkingService] Customer already linked to this user');
              return customer.id;
            } else {
              console.warn('[CustomerAccountLinkingService] Customer already linked to different user');
              return null;
            }
          }
          
          // Update customer with user ID
          const customerRef = doc(db, 'customers', customer.id);
          transaction.update(customerRef, {
            userId: userId,
            email: email, // Update email to match user account
            updatedAt: serverTimestamp()
          });
          
          // Update user with customer ID
          const userRef = doc(db, 'users', userId);
          const userDoc = await transaction.get(userRef);
          
          if (userDoc.exists()) {
            transaction.update(userRef, {
              linkedCustomerId: customer.id,
              updatedAt: serverTimestamp()
            });
          }
          
          console.log(`[CustomerAccountLinkingService] Linked user ${userId} to customer ${customer.id}`);
          return customer.id;
        } else {
          // Create a new customer record
          console.log('[CustomerAccountLinkingService] No existing customer found, creating new customer record');
          
          const nameParts = name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          const normalizedPhone = this.normalizePhoneNumber(phone);
          
          const customerData = {
            firstName,
            lastName,
            email: email,
            phone: phone,
            phone_normalized: normalizedPhone,
            userId: userId,
            joinDate: serverTimestamp(),
            createdAt: serverTimestamp()
          };
          
          const newCustomerRef = doc(collection(db, 'customers'));
          transaction.set(newCustomerRef, customerData);
          
          // Update user with customer ID
          const userRef = doc(db, 'users', userId);
          const userDoc = await transaction.get(userRef);
          
          if (userDoc.exists()) {
            transaction.update(userRef, {
              linkedCustomerId: newCustomerRef.id,
              updatedAt: serverTimestamp()
            });
          }
          
          console.log(`[CustomerAccountLinkingService] Created new customer record: ${newCustomerRef.id}`);
          return newCustomerRef.id;
        }
      });
    } catch (error) {
      console.error('[CustomerAccountLinkingService] Error processing user registration:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const customerAccountLinkingService = new CustomerAccountLinkingService();

// Export the findCustomerByPhone function for backward compatibility
export const findCustomerByPhone = (phone: string) => {
  return customerAccountLinkingService.findCustomerByPhone(phone);
};

// Export the linkUserToCustomer function for backward compatibility
export const linkUserToCustomer = (userId: string, customerId: string) => {
  return customerAccountLinkingService.linkUserToCustomer(userId, customerId);
};