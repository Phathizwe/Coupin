// src/services/customerDataService.ts
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { QueryOptimizer } from './firestore/optimizers/queryOptimizer';

/**
 * Service for handling customer data with optimized fields
 */
export class CustomerDataService {
  /**
   * Create a new customer with normalized phone field
   */
  static async createCustomer(customerData: any) {
    // Add normalized phone field if phone exists
    const enhancedData = this.enhanceCustomerData(customerData);
    
    // Create new customer document
    const customersRef = collection(db, 'customers');
    const docRef = await addDoc(customersRef, enhancedData);
    
    return {
      id: docRef.id,
      ...enhancedData
    };
  }
  
  /**
   * Update an existing customer with normalized phone field
   */
  static async updateCustomer(customerId: string, customerData: any) {
    // Add normalized phone field if phone exists
    const enhancedData = this.enhanceCustomerData(customerData);
    
    // Update customer document
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, enhancedData);
    
    return {
      id: customerId,
      ...enhancedData
    };
  }
  
  /**
   * Enhance customer data with normalized fields
   */
  private static enhanceCustomerData(customerData: any) {
    const enhancedData = { ...customerData };
    
    // Add normalized phone field if phone exists
    if (customerData.phone) {
      enhancedData.phone_normalized = QueryOptimizer.normalizePhoneNumber(customerData.phone);
    }
    
    return enhancedData;
  }
}