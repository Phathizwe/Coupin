import { 
  doc, 
  updateDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service for handling user phone number updates and customer linking
 * This service works within the constraints of the existing Firestore rules
 */
export class UserPhoneService {
  /**
   * Normalize a phone number by removing all non-digit characters
   * 
   * @param phone The phone number to normalize
   * @returns The normalized phone number (digits only)
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  /**
   * Update a user's phone number
   * 
   * @param userId The user ID
   * @param phoneNumber The phone number to set
   * @returns Promise that resolves when the update is complete
   */
  async updateUserPhoneNumber(userId: string, phoneNumber: string): Promise<boolean> {
    try {
      if (!userId || !phoneNumber) {
        console.error('Missing userId or phoneNumber');
        return false;
      }

      // Normalize the phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Update the user document with the phone number
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
        phoneNumber_normalized: normalizedPhone,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Updated phone number for user ${userId}: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error updating user phone number:', error);
      return false;
    }
  }

  /**
   * Find customers by phone number and link them to the user
   * 
   * @param userId The user ID
   * @param phoneNumber The phone number to search for
   * @returns Promise that resolves to the customer ID if found and linked
   */
  async findAndLinkCustomerByPhone(userId: string, phoneNumber: string): Promise<string | null> {
    try {
      if (!userId || !phoneNumber) {
        console.error('Missing userId or phoneNumber');
        return null;
      }

      // Normalize the phone number for comparison
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Get all customers (we'll filter client-side to work around permission issues)
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      
      // Check if we got any results
      if (customersSnapshot.empty) {
        console.log('No customers found');
        return null;
      }
      
      // Find a customer with a matching phone number
      let matchingCustomerId: string | null = null;
      
      for (const customerDoc of customersSnapshot.docs) {
        try {
          const customerData = customerDoc.data();
          const customerPhone = customerData.phone || '';
          const customerNormalizedPhone = this.normalizePhoneNumber(customerPhone);
          
          // Check for a match with the normalized phone
          if (customerNormalizedPhone === normalizedPhone) {
            console.log(`Found customer with matching phone: ${customerDoc.id}`);
            matchingCustomerId = customerDoc.id;
            break;
          }
          
          // Check for South African number format variations
          if (customerNormalizedPhone.startsWith('27') && normalizedPhone.startsWith('0')) {
            if (customerNormalizedPhone.substring(2) === normalizedPhone.substring(1)) {
              console.log(`Found customer with matching phone (SA format): ${customerDoc.id}`);
              matchingCustomerId = customerDoc.id;
              break;
            }
          }
          
          if (normalizedPhone.startsWith('27') && customerNormalizedPhone.startsWith('0')) {
            if (normalizedPhone.substring(2) === customerNormalizedPhone.substring(1)) {
              console.log(`Found customer with matching phone (SA format): ${customerDoc.id}`);
              matchingCustomerId = customerDoc.id;
              break;
            }
          }
        } catch (error) {
          // Skip this document if there's an error accessing it
          console.warn(`Error processing customer document ${customerDoc.id}:`, error);
        }
      }
      
      // If we found a matching customer, link it to the user
      if (matchingCustomerId) {
        try {
          // Update the customer with the user ID
          const customerRef = doc(db, 'customers', matchingCustomerId);
          await updateDoc(customerRef, {
            userId: userId,
            updatedAt: serverTimestamp()
          });
          
          // Update the user with the linked customer ID
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            linkedCustomerId: matchingCustomerId,
            updatedAt: serverTimestamp()
          });
          
          console.log(`Linked user ${userId} to customer ${matchingCustomerId}`);
          return matchingCustomerId;
        } catch (error) {
          console.error('Error linking customer to user:', error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding and linking customer:', error);
      return null;
    }
  }

  /**
   * Update a user's phone number and link to any matching customers
   * This is a combined operation that handles both updating the phone number
   * and finding/linking any matching customers
   * 
   * @param userId The user ID
   * @param phoneNumber The phone number
   * @returns Promise that resolves to the customer ID if found and linked
   */
  async updatePhoneAndLinkCustomer(userId: string, phoneNumber: string): Promise<string | null> {
    try {
      // First update the user's phone number
      const updated = await this.updateUserPhoneNumber(userId, phoneNumber);
      
      if (!updated) {
        console.error('Failed to update user phone number');
        return null;
      }
      
      // Then find and link any matching customers
      return await this.findAndLinkCustomerByPhone(userId, phoneNumber);
    } catch (error) {
      console.error('Error updating phone and linking customer:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const userPhoneService = new UserPhoneService();