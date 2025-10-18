import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Customer, LoyaltyProgram } from '../../types';

/**
 * Service for handling customer loyalty program functionality
 */
export const customerLoyaltyService = {
  /**
   * Get all loyalty programs for a customer
   */
  getCustomerLoyaltyPrograms: async (userId: string): Promise<LoyaltyProgram[]> => {
    try {
      console.log('Looking up loyalty programs for user:', userId);
      
      // First, find the customer record by userId
      const customersRef = collection(db, 'customers');
      const customerQuery = query(customersRef, where('userId', '==', userId));
      const customerSnapshot = await getDocs(customerQuery);
    
      if (customerSnapshot.empty) {
        console.log('No customer record found for userId:', userId);
        return [];
      }
      
      // Get the customer data
      const customerDoc = customerSnapshot.docs[0];
      const customer = { id: customerDoc.id, ...customerDoc.data() } as Customer;
      console.log('Found customer record:', customer);
      
      // APPROACH 1: Try to find by business ID (similar to how coupons work)
  try {
        const businessId = customer.businessId;
        if (businessId) {
          console.log('Looking up loyalty programs by business ID:', businessId);
          
          const programsRef = collection(db, 'loyaltyPrograms');
          const programsQuery = query(
            programsRef,
            where('businessId', '==', businessId)
          );
          
          const programsSnapshot = await getDocs(programsQuery);
          
          if (!programsSnapshot.empty) {
            const programs = programsSnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            })) as LoyaltyProgram[];
            
            console.log('Found loyalty programs by business ID:', programs);
            
            // Filter for active programs
            const activePrograms = programs.filter(program => program.active !== false);
            if (activePrograms.length > 0) {
              return activePrograms;
            }
          }
        }
      } catch (error) {
        console.error('Error querying loyalty programs by business ID:', error);
      }
      
      // APPROACH 2: Check if the customer has a loyaltyProgramId
      if (customer.loyaltyProgramId) {
        console.log('Looking up loyalty program with ID:', customer.loyaltyProgramId);
        
        // Get the loyalty program directly by ID
        try {
          const programRef = doc(db, 'loyaltyPrograms', customer.loyaltyProgramId);
          const programSnapshot = await getDoc(programRef);
          
          if (programSnapshot.exists()) {
            const program = { id: programSnapshot.id, ...programSnapshot.data() } as LoyaltyProgram;
            console.log('Found loyalty program by direct ID lookup:', program);
            
            // Only return active programs
            if (program.active !== false) {
              return [program];
    }
          }
    } catch (error) {
          console.error('Error getting loyalty program by ID:', error);
  }
      }
      
      console.log('No active loyalty programs found for customer');
      return [];
    } catch (error) {
      console.error('Error getting customer loyalty programs:', error);
      return [];
    }
  },
  
  /**
   * Get a customer's loyalty points for a specific program
   */
  getCustomerLoyaltyPoints: async (customerId: string, programId: string): Promise<number> => {
    try {
      const customerRef = doc(db, 'customers', customerId);
      const customerSnapshot = await getDoc(customerRef);
      
      if (!customerSnapshot.exists()) {
        return 0;
      }
      
      const customer = customerSnapshot.data() as Customer;
      
      // Check if the customer is in this loyalty program
      if (customer.loyaltyProgramId !== programId) {
        return 0;
      }
      
      return customer.loyaltyPoints || 0;
    } catch (error) {
      console.error('Error getting customer loyalty points:', error);
      return 0;
    }
  }
};