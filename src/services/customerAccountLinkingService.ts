import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc
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
      
      // First try with the normalized phone number
      const customersRef = collection(db, 'customers');
      
      // Try with normalized_phone field first (if it exists from migration)
      const normalizedQuery = query(
        customersRef,
        where('phone_normalized', '==', normalizedPhone)
      );
      
      let customersSnapshot = await getDocs(normalizedQuery);
      
      // If not found, try with the phone field
      if (customersSnapshot.empty) {
        const phoneQuery = query(
          customersRef,
          where('phone', '==', normalizedPhone)
        );
        
        customersSnapshot = await getDocs(phoneQuery);
      }
      
      // If still not found, try with the original phone format
      if (customersSnapshot.empty) {
        const originalQuery = query(
          customersRef,
          where('phone', '==', phone)
        );
        
        customersSnapshot = await getDocs(originalQuery);
      }
      
      // If we found a match, return the first customer
      if (!customersSnapshot.empty) {
        const customerData = customersSnapshot.docs[0].data();
        return {
          ...customerData,
          id: customersSnapshot.docs[0].id
        };
      }
      
      // If still not found, try a more flexible approach by querying all customers
      // and comparing normalized phone numbers (this is more expensive but handles edge cases)
      const allCustomersQuery = query(customersRef);
      const allCustomersSnapshot = await getDocs(allCustomersQuery);
      
      if (!allCustomersSnapshot.empty) {
        for (const doc of allCustomersSnapshot.docs) {
          const customerData = doc.data();
          const customerPhone = this.normalizePhoneNumber(customerData.phone || '');
          
          // If the normalized phone numbers match
          if (customerPhone && customerPhone === normalizedPhone) {
            return {
              ...customerData,
              id: doc.id
            };
          }
          
          // Check for numbers that might have country code differences
          // For example, +27832091122 vs 0832091122 (South African format)
          // This handles cases where one number has country code and the other doesn't
          if (customerPhone && (
              (customerPhone.startsWith('27') && normalizedPhone.startsWith('0') && 
               customerPhone.substring(2) === normalizedPhone.substring(1)) ||
              (normalizedPhone.startsWith('27') && customerPhone.startsWith('0') && 
               normalizedPhone.substring(2) === customerPhone.substring(1))
          )) {
            return {
              ...customerData,
              id: doc.id
            };
          }
        }
      }
      
      console.log(`No customer found with phone ${phone}`);
      return null;
    } catch (error) {
      console.error('Error finding customer by phone:', error);
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
      // Check if the customer exists
      const customerRef = doc(db, 'customers', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (!customerDoc.exists()) {
        console.error(`Customer ${customerId} does not exist`);
        return false;
      }
      
      // Check if the customer is already linked to a different user
      const customerData = customerDoc.data();
      if (customerData.userId && customerData.userId !== userId) {
        console.warn(`Customer ${customerId} is already linked to user ${customerData.userId}`);
        // You may want to handle this case differently depending on your requirements
      }
      
      // Update the customer record with the user ID
      await updateDoc(customerRef, {
        userId: userId,
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
}

// Export a singleton instance
export const customerAccountLinkingService = new CustomerAccountLinkingService();