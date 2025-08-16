/**
 * Comprehensive customer account linking service
 * Integrates phone normalization, customer lookup, and user-customer linking
 */
import { collection, doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from '../utils/phoneUtils';
import { findCustomerByPhone as findCustomer } from './customerLookupService';
import { linkCustomerToUser, linkUserToCustomer as linkUser } from './customerLinkingService';

/**
 * Service for managing customer-user account linking
 */
export class CustomerAccountLinkingService {
  /**
   * Process a new user registration and link to existing customer if found
   * 
   * @param userId The user ID
   * @param phone The phone number
   * @param email The email address
   * @param name The user's name
   * @returns The linked customer ID if found and linked, null otherwise
   */
  async processUserRegistration(
    userId: string, 
    phone: string, 
    email: string, 
    name: string
  ): Promise<string | null> {
    if (!phone) {
      console.log('⚠️ No phone number provided for customer linking');
      return null;
    }
    
    console.log('🔄 Processing user registration for linking', { userId, phone });
    
    try {
      // Step 1: Find existing customer by phone
      const normalizedPhone = normalizePhoneNumber(phone);
      const existingCustomer = await this.findCustomerByPhone(normalizedPhone);
      
      if (existingCustomer) {
        console.log('✅ Found existing customer to link:', existingCustomer.id);
        
        // Step 2: Link customer to user
        await this.linkUserToCustomer(userId, existingCustomer.id);
        
        // Step 3: Update user record with customer ID
        await this.updateUserWithCustomerId(userId, existingCustomer.id);
        
        return existingCustomer.id;
      } else {
        console.log('ℹ️ No existing customer found, creating new customer record');
        
        // Create new customer record
        const newCustomerId = await this.createNewCustomer(userId, {
          phone: normalizedPhone,
          email,
          name
        });
        
        // Update user record with new customer ID
        await this.updateUserWithCustomerId(userId, newCustomerId);
        
        return newCustomerId;
      }
    } catch (error) {
      console.error('❌ Error in processUserRegistration:', error);
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
  async updateUserPhoneAndLinkCustomer(
    userId: string,
    phone: string
  ): Promise<string | null> {
    if (!phone) return null;
    
    console.log('🔄 Updating user phone and checking for customer linking', { userId, phone });
    
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Update user's phone number
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        phoneNumber: normalizedPhone,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      // Look for existing customer with this phone
      const existingCustomer = await this.findCustomerByPhone(normalizedPhone);
      
      if (existingCustomer) {
        console.log('✅ Found existing customer to link:', existingCustomer.id);
        
        // Link customer to user
        await this.linkUserToCustomer(userId, existingCustomer.id);
        
        // Update user record with customer ID
        await this.updateUserWithCustomerId(userId, existingCustomer.id);
        
        return existingCustomer.id;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error in updateUserPhoneAndLinkCustomer:', error);
      return null;
    }
  }
  
  /**
   * Find a customer by phone number
   * Wrapper for the findCustomerByPhone function in customerLookupService
   * 
   * @param phone The phone number to search for
   * @returns The customer data if found, null otherwise
   */
  async findCustomerByPhone(phone: string) {
    return findCustomer(phone);
  }
  
  /**
   * Link a user to a customer record
   * Wrapper for the linkUserToCustomer function in customerLinkingService
   * 
   * @param userId The user ID to link
   * @param customerId The customer ID to link to
   * @returns Promise that resolves to true if successful, false otherwise
   */
  async linkUserToCustomer(userId: string, customerId: string) {
    return linkUser(userId, customerId);
  }
  
  /**
   * Create a new customer record
   * 
   * @param userId The user ID to associate with the customer
   * @param customerData The customer data
   * @returns The ID of the created customer
   */
  private async createNewCustomer(
    userId: string, 
    customerData: { 
      phone: string; 
      email?: string; 
      name?: string;
    }
  ): Promise<string> {
    const customersRef = collection(db, 'customers');
    const newCustomerRef = doc(customersRef);
    
    const newCustomer = {
      id: newCustomerRef.id,
      userId,
      phone: customerData.phone,
      email: customerData.email || null,
      name: customerData.name || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      linkedAt: Timestamp.now()
    };
    
    await setDoc(newCustomerRef, newCustomer);
    console.log('✅ Created new customer record:', newCustomerRef.id);
    
    return newCustomerRef.id;
  }
  
  /**
   * Update user record with linked customer ID
   * 
   * @param userId The user ID to update
   * @param customerId The customer ID to link
   */
  private async updateUserWithCustomerId(userId: string, customerId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      linkedCustomerId: customerId,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    console.log('✅ Updated user record with linkedCustomerId:', customerId);
  }
}

// Export singleton instance
export const customerAccountLinkingService = new CustomerAccountLinkingService();