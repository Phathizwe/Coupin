import { collection, query, where, getDocs, getDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Customer } from '../../types'; // Fixed import path

export interface BusinessCustomer extends Customer {
  totalCoupons?: number;
  lastVisit?: Date;
  loyaltyPrograms?: {
    programId: string;
    programName: string;
    points: number;
    visits: number;
  }[];
}

/**
 * Fetches all customers for a business
 * @param businessId The business ID to fetch customers for
 * @returns Array of customers
 */
export const fetchBusinessCustomers = async (businessId: string): Promise<BusinessCustomer[]> => {
  try {
    console.log(`Fetching customers for business: ${businessId}`);
    
    // Query the customers collection for this business
    const customersRef = collection(db, 'customers');
    const customersQuery = query(
      customersRef,
      where('businessId', '==', businessId),
      orderBy('joinDate', 'desc')
    );
    const customersSnapshot = await getDocs(customersQuery);
    
    console.log(`Found ${customersSnapshot.size} customers for business: ${businessId}`);
    
    // If no customers are found, return an empty array
    if (customersSnapshot.empty) {
      return [];
    }
    
    // Process each customer
    const customers: BusinessCustomer[] = [];
    for (const customerDoc of customersSnapshot.docs) {
      const customerData = customerDoc.data();
      
      // Get coupon count for this customer
      const couponCount = await countCustomerCoupons(businessId, customerDoc.id);
      
      // Get loyalty programs for this customer
      const loyaltyPrograms = await getCustomerLoyaltyPrograms(businessId, customerDoc.id);
      
      customers.push({
        id: customerDoc.id,
        businessId: customerData.businessId,
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        birthdate: customerData.birthdate,
        joinDate: customerData.joinDate,
        lastVisit: customerData.lastVisit?.toDate(),
        totalSpent: customerData.totalSpent || 0,
        totalVisits: customerData.totalVisits || 0,
        notes: customerData.notes || '',
        tags: customerData.tags || [],
        loyaltyPoints: customerData.loyaltyPoints || 0,
        userId: customerData.userId || '',
        totalCoupons: couponCount,
        loyaltyPrograms
      });
    }
    
    return customers;
  } catch (error) {
    console.error('Error fetching business customers:', error);
    return [];
  }
};

/**
 * Counts the number of coupons a customer has from a business
 * @param businessId The business ID
 * @param customerId The customer ID
 * @returns Number of coupons
 */
const countCustomerCoupons = async (businessId: string, customerId: string): Promise<number> => {
  try {
    // Check couponDistributions collection
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('businessId', '==', businessId),
      where('customerId', '==', customerId)
    );
    const distributionsSnapshot = await getDocs(distributionsQuery);
    
    // Check customerCoupons collection
    const customerCouponsRef = collection(db, 'customerCoupons');
    const customerCouponsQuery = query(
      customerCouponsRef,
      where('businessId', '==', businessId),
      where('customerId', '==', customerId)
    );
    const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
    
    return distributionsSnapshot.size + customerCouponsSnapshot.size;
  } catch (error) {
    console.error('Error counting customer coupons:', error);
    return 0;
  }
};

/**
 * Gets loyalty programs a customer is enrolled in for a business
 * @param businessId The business ID
 * @param customerId The customer ID
 * @returns Array of loyalty program information
 */
const getCustomerLoyaltyPrograms = async (
  businessId: string, 
  customerId: string
): Promise<{ programId: string; programName: string; points: number; visits: number; }[]> => {
  try {
    // Check customerPrograms collection
    const programsRef = collection(db, 'customerPrograms');
    const programsQuery = query(
      programsRef,
      where('businessId', '==', businessId),
      where('customerId', '==', customerId)
    );
    const programsSnapshot = await getDocs(programsQuery);
    
    const programs: { programId: string; programName: string; points: number; visits: number; }[] = [];
    
    programsSnapshot.forEach(doc => {
      const data = doc.data();
      programs.push({
        programId: data.programId,
        programName: data.programName || 'Loyalty Program',
        points: data.currentPoints || 0,
        visits: data.currentVisits || 0
      });
    });
    
    return programs;
  } catch (error) {
    console.error('Error getting customer loyalty programs:', error);
    return [];
  }
};

/**
 * Finds a customer by phone number
 * @param businessId The business ID
 * @param phoneNumber The phone number to search for
 * @returns Customer object or null if not found
 */
export const findCustomerByPhone = async (
  businessId: string, 
  phoneNumber: string
): Promise<BusinessCustomer | null> => {
  try {
    console.log(`Looking for customer with phone: ${phoneNumber} for business: ${businessId}`);
    
    // Normalize the phone number by removing spaces, dashes, etc.
    const normalizedPhone = phoneNumber.replace(/\s+|-|\(|\)|\+/g, '');
    console.log(`Normalized phone number: ${normalizedPhone}`);
    
    // Try different phone number formats
    const phoneFormats = [
      phoneNumber,
      normalizedPhone,
      `+${normalizedPhone}`,
      normalizedPhone.startsWith('27') ? `+${normalizedPhone}` : `+27${normalizedPhone}`
    ];
    
    // Check each phone format
    for (const phone of phoneFormats) {
      console.log(`Trying phone format: ${phone}`);
      
      // Query the customers collection
      const customersRef = collection(db, 'customers');
      const customersQuery = query(
        customersRef,
        where('phone', '==', phone)
      );
      const customersSnapshot = await getDocs(customersQuery);
      
      if (!customersSnapshot.empty) {
        console.log(`Found ${customersSnapshot.size} customers with phone: ${phone}`);
        
        // Find the customer for this business
        for (const customerDoc of customersSnapshot.docs) {
          const customerData = customerDoc.data();
          
          // If this customer belongs to the business, return it
          if (customerData.businessId === businessId) {
            console.log(`Found customer: ${customerData.firstName} ${customerData.lastName} for business: ${businessId}`);
            
            // Get coupon count for this customer
            const couponCount = await countCustomerCoupons(businessId, customerDoc.id);
            
            // Get loyalty programs for this customer
            const loyaltyPrograms = await getCustomerLoyaltyPrograms(businessId, customerDoc.id);
            
            return {
              id: customerDoc.id,
              businessId: customerData.businessId,
              firstName: customerData.firstName || '',
              lastName: customerData.lastName || '',
              email: customerData.email || '',
              phone: customerData.phone || '',
              birthdate: customerData.birthdate,
              joinDate: customerData.joinDate,
              lastVisit: customerData.lastVisit?.toDate(),
              totalSpent: customerData.totalSpent || 0,
              totalVisits: customerData.totalVisits || 0,
              notes: customerData.notes || '',
              tags: customerData.tags || [],
              loyaltyPoints: customerData.loyaltyPoints || 0,
              userId: customerData.userId || '',
              totalCoupons: couponCount,
              loyaltyPrograms
            };
          }
        }
      }
    }
    
    // If we reach here, no customer was found
    console.log(`No customer found with phone: ${phoneNumber} for business: ${businessId}`);
    return null;
  } catch (error) {
    console.error('Error finding customer by phone:', error);
    return null;
  }
};