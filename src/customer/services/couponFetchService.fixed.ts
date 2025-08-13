import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  or
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { findCustomerByUserId } from '../../services/customerLinkingService';

/**
 * Fetches coupon IDs from all relevant collections for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @param pageSize Number of items per page
 * @returns Array of unique coupon IDs
 */
export const fetchCouponIds = async (idsToSearch: string[], pageSize: number): Promise<string[]> => {
  try {
    // First, check if the user is linked to a customer profile to get phone number
    let customerPhone: string | undefined;
    if (idsToSearch.length > 0) {
      try {
        const linkedCustomer = await findCustomerByUserId(idsToSearch[0]);
        customerPhone = linkedCustomer?.phone;
        console.log('Linked customer phone:', customerPhone || 'No phone');
      } catch (error) {
        console.warn('Error finding linked customer, continuing without phone lookup:', error);
        // Continue without phone lookup
      }
    }
    
    // Initialize empty arrays for each document type
    let distributionDocs: any[] = [];
    let customerCouponDocs: any[] = [];
    let phoneLinkedDocs: any[] = [];
    
    // Use Promise.allSettled to handle partial failures
    const [distributionsResult, customerCouponsResult, phoneResult] = await Promise.allSettled([
      // Check the couponDistributions collection
      (async () => {
        try {
          return await fetchDistributionDocs(idsToSearch);
        } catch (error) {
          console.error('Error fetching distributions:', error);
          return [];
        }
      })(),
      
      // Check the customerCoupons collection
      (async () => {
        try {
          return await fetchCustomerCouponDocs(idsToSearch, pageSize);
        } catch (error) {
          console.error('Error fetching customer coupons:', error);
          return [];
        }
      })(),
      
      // If we have a phone number, check for phone-linked distributions
      (async () => {
        if (customerPhone) {
          try {
            return await fetchPhoneLinkedCoupons(customerPhone);
          } catch (error) {
            console.error('Error fetching phone-linked coupons:', error);
            return [];
          }
        }
        return [];
      })()
    ]);
    
    // Extract results from Promise.allSettled
    if (distributionsResult.status === 'fulfilled') {
      distributionDocs = distributionsResult.value;
      console.log('Total distributions found:', distributionDocs.length);
    }
    
    if (customerCouponsResult.status === 'fulfilled') {
      customerCouponDocs = customerCouponsResult.value;
      console.log('Total customer coupons found:', customerCouponDocs.length);
    }
    
    if (phoneResult.status === 'fulfilled') {
      phoneLinkedDocs = phoneResult.value;
      console.log('Total phone-linked documents found:', phoneLinkedDocs.length);
    }
    
    // Combine all sources of coupon IDs
    const couponIds = [
      ...distributionDocs.map(doc => doc.data()?.couponId),
      ...customerCouponDocs.map(doc => doc.data()?.couponId),
      ...phoneLinkedDocs.map(doc => doc.data()?.couponId)
    ].filter((id): id is string => id !== undefined) // Filter out undefined values
     .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
    
    console.log('Combined unique coupon IDs:', couponIds);
    return couponIds;
  } catch (error) {
    console.error('Error in fetchCouponIds:', error);
    // Return empty array instead of throwing to prevent cascading failures
    return [];
  }
};

/**
 * Fetches distribution documents for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @returns Array of distribution documents
 */
const fetchDistributionDocs = async (idsToSearch: string[]) => {
  const allDocs = [];
  
  for (const id of idsToSearch) {
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('customerId', '==', id)
    );
    
    console.log(`Checking couponDistributions collection for ID: ${id}...`);
    const snapshot = await getDocs(distributionsQuery);
    console.log(`Found ${snapshot.size} distributions for ID: ${id}`);
    
    allDocs.push(...snapshot.docs);
  }
  
  return allDocs;
};

/**
 * Fetches customer coupon documents for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @param pageSize Number of items per page
 * @returns Array of customer coupon documents
 */
const fetchCustomerCouponDocs = async (idsToSearch: string[], pageSize: number) => {
  const allDocs = [];
  
  for (const id of idsToSearch) {
    // Query 1: Check for customerId
    const customerCouponsRef1 = collection(db, 'customerCoupons');
    const customerIdQuery = query(
      customerCouponsRef1,
      where('customerId', '==', id),
      orderBy('allocatedDate', 'desc'),
      limit(pageSize)
    );
    
    console.log(`Checking customerCoupons collection for customerId: ${id}...`);
    const customerIdSnapshot = await getDocs(customerIdQuery);
    console.log(`Found ${customerIdSnapshot.size} customer coupons with customerId: ${id}`);
    
    allDocs.push(...customerIdSnapshot.docs);
    
    // Query 2: Check for userId
    const customerCouponsRef2 = collection(db, 'customerCoupons');
    const userIdQuery = query(
      customerCouponsRef2,
      where('userId', '==', id),
      orderBy('allocatedDate', 'desc'),
      limit(pageSize)
    );
    
    console.log(`Checking customerCoupons collection for userId: ${id}...`);
    const userIdSnapshot = await getDocs(userIdQuery);
    console.log(`Found ${userIdSnapshot.size} customer coupons with userId: ${id}`);
    
    allDocs.push(...userIdSnapshot.docs);
  }
  
  return allDocs;
};

/**
 * Fetches coupon documents linked to a phone number
 * @param phone The customer's phone number
 * @returns Array of coupon documents
 */
const fetchPhoneLinkedCoupons = async (phone: string) => {
  const allDocs = [];
  
  try {
    console.log(`Looking up customers with phone number: ${phone}`);
    
    // Normalize the phone number by removing spaces, dashes, etc.
    const normalizedPhone = phone.replace(/\s+|-|\(|\)|\+/g, '');
    
    // Find all customers with this phone number (there might be duplicates)
    const customersRef = collection(db, 'customers');
    
    // Try with normalized phone
    const phoneQuery = query(
      customersRef,
      where('phone', '==', normalizedPhone)
    );
    const phoneCustomersSnapshot = await getDocs(phoneQuery);
    
    // If no results with normalized phone, try with original format
    let customerDocs = phoneCustomersSnapshot.docs;
    if (customerDocs.length === 0) {
      const fallbackQuery = query(
        customersRef,
        where('phone', '==', phone)
      );
      const fallbackSnapshot = await getDocs(fallbackQuery);
      customerDocs = fallbackSnapshot.docs;
    }
    
    console.log(`Found ${customerDocs.length} customers with phone number: ${phone}`);
    
    // For each customer with this phone number, find associated coupons
    for (const customerDoc of customerDocs) {
      const phoneCustomerId = customerDoc.id;
      console.log(`Checking distributions for phone-linked customer ID: ${phoneCustomerId}`);
      
      // Check couponDistributions for this customer
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        where('customerId', '==', phoneCustomerId)
      );
      const distributionsSnapshot = await getDocs(distributionsQuery);
      
      console.log(`Found ${distributionsSnapshot.size} distributions for phone-linked customer ID: ${phoneCustomerId}`);
      allDocs.push(...distributionsSnapshot.docs);
      
      // Check customer coupons for this customer
      const customerCouponsRef = collection(db, 'customerCoupons');
      const customerCouponsQuery = query(
        customerCouponsRef,
        where('customerId', '==', phoneCustomerId)
      );
      const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
      
      console.log(`Found ${customerCouponsSnapshot.size} customer coupons for phone-linked customer ID: ${phoneCustomerId}`);
      allDocs.push(...customerCouponsSnapshot.docs);
    }
  } catch (error) {
    console.error('Error getting coupons from phone number:', error);
  }
  
  return allDocs;
};