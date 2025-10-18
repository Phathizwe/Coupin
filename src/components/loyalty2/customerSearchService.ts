import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Customer } from '../../types';
import { phoneUtils } from './phoneUtils';

/**
 * Service for customer search functionality
 */
export const customerSearchService = {
  /**
   * Search for customers by name, email, or phone
   */
  searchCustomers: async (
    searchTerm: string, 
    businessId: string,
    setDebugInfo?: (info: any) => void
  ): Promise<Customer[]> => {
    const customersRef = collection(db, 'customers');
    const searchTermLower = searchTerm.toLowerCase();
    
    // We'll search by phone number if the search term contains only numbers and optional + at start
    if (/^[+]?\d[\d\s-]*$/.test(searchTerm)) {
      // Normalize the phone number and generate possible formats
      const normalizedPhone = phoneUtils.normalizePhoneForComparison(searchTerm);
      const phoneFormats = phoneUtils.generatePhoneFormats(searchTerm);
      
      console.log('Searching for customer with phone formats:', phoneFormats);
      if (setDebugInfo) {
        setDebugInfo({
          originalPhone: searchTerm,
          normalizedPhone,
          phoneFormats,
          businessId
        });
      }
      
      // Get all customers for this business
      const q = query(
        customersRef,
        where('businessId', '==', businessId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      } else {
        const fetchedCustomers: Customer[] = [];
        
        snapshot.forEach(doc => {
          const customer = { id: doc.id, ...doc.data() } as Customer;
          
          if (customer.phone) {
            // Use our custom matching function
            if (phoneUtils.phoneNumbersMatch(customer.phone, searchTerm)) {
              fetchedCustomers.push(customer);
            }
          }
        });
        
        return fetchedCustomers;
      }
    } else {
      // For text search, we'll fetch all customers and filter client-side
      const q = query(
        customersRef,
        where('businessId', '==', businessId)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const fetchedCustomers: Customer[] = [];
        snapshot.forEach(doc => {
          const customer = { id: doc.id, ...doc.data() } as Customer;
          const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
          const email = (customer.email || '').toLowerCase();
          
          if (fullName.includes(searchTermLower) || email.includes(searchTermLower)) {
            fetchedCustomers.push(customer);
          }
        });
        
        return fetchedCustomers;
      } else {
        return [];
      }
    }
  }
};