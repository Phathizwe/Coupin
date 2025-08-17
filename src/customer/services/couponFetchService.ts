import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  documentId,
  getDoc,
  doc
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
    // Validate input
    if (!idsToSearch || idsToSearch.length === 0 || !idsToSearch[0]) {
      console.warn('Invalid or empty IDs provided to fetchCouponIds');
      return [];
    }
    
    // First, check if the user is linked to a customer profile to get phone number
    let customerPhone: string | undefined;
    let linkedCustomerId: string | undefined;
    
    try {
      const linkedCustomer = await findCustomerByUserId(idsToSearch[0]);
      customerPhone = linkedCustomer?.phone;
      linkedCustomerId = linkedCustomer?.id;
      console.log('Linked customer phone:', customerPhone || 'No phone');
      console.log('Linked customer ID:', linkedCustomerId || 'Not linked');
    } catch (error) {
      console.warn('Error finding linked customer, continuing without phone lookup:', error);
      // Continue without phone lookup
    }
    
    // Initialize empty arrays for each document type
    let distributionDocs: any[] = [];
    let customerCouponDocs: any[] = [];
    let phoneLinkedDocs: any[] = [];
    let businessCouponDocs: any[] = [];
    
    // Use Promise.allSettled to handle partial failures
    const [distributionsResult, customerCouponsResult, phoneResult, businessCouponsResult] = await Promise.allSettled([
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
      })(),
      
      // Fetch all active business coupons as a fallback
      (async () => {
        try {
          return await fetchBusinessCoupons(idsToSearch[0]);
        } catch (error) {
          console.error('Error fetching business coupons:', error);
          return [];
        }
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
    
    if (businessCouponsResult.status === 'fulfilled') {
      businessCouponDocs = businessCouponsResult.value;
      console.log('Total business coupons found:', businessCouponDocs.length);
    }
    
    // Combine all sources of coupon IDs
    const couponIds = [
      ...distributionDocs.map(doc => doc.data()?.couponId),
      ...customerCouponDocs.map(doc => doc.data()?.couponId),
      ...phoneLinkedDocs.map(doc => doc.data()?.couponId),
      ...businessCouponDocs.map(doc => doc.id) // Business coupons use the doc ID directly
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
    try {
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        where('customerId', '==', id)
      );
      
      console.log(`Checking couponDistributions collection for ID: ${id}...`);
      const snapshot = await getDocs(distributionsQuery);
      console.log(`Found ${snapshot.size} distributions for ID: ${id}`);
      
      allDocs.push(...snapshot.docs);
    } catch (error) {
      // Don't throw, just log and continue
      console.error(`Error fetching distributions for ID ${id}:`, error);
    }
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
    try {
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
    } catch (error) {
      // Don't throw, just log and continue
      console.error(`Error fetching customer coupons for ID ${id}:`, error);
    }
    
    try {
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
    } catch (error) {
      // Don't throw, just log and continue
      console.error(`Error fetching customer coupons for ID ${id}:`, error);
    }
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
      const businessId = customerDoc.data().businessId;
      console.log(`Checking distributions for phone-linked customer ID: ${phoneCustomerId} (Business: ${businessId})`);
      
      try {
        // Check couponDistributions for this customer
        const distributionsRef = collection(db, 'couponDistributions');
        const distributionsQuery = query(
          distributionsRef,
          where('customerId', '==', phoneCustomerId)
        );
        const distributionsSnapshot = await getDocs(distributionsQuery);
        
        console.log(`Found ${distributionsSnapshot.size} distributions for phone-linked customer ID: ${phoneCustomerId}`);
        allDocs.push(...distributionsSnapshot.docs);
      } catch (error) {
        console.error(`Error fetching distributions for phone-linked customer ${phoneCustomerId}:`, error);
      }
      
      try {
        // Check customer coupons for this customer
        const customerCouponsRef = collection(db, 'customerCoupons');
        const customerCouponsQuery = query(
          customerCouponsRef,
          where('customerId', '==', phoneCustomerId)
        );
        const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
        
        console.log(`Found ${customerCouponsSnapshot.size} customer coupons for phone-linked customer ID: ${phoneCustomerId}`);
        allDocs.push(...customerCouponsSnapshot.docs);
      } catch (error) {
        console.error(`Error fetching customer coupons for phone-linked customer ${phoneCustomerId}:`, error);
      }
      
      // If this is a business customer, also fetch business coupons
      if (businessId) {
        try {
          const businessCouponsRef = collection(db, 'coupons');
          const businessCouponsQuery = query(
            businessCouponsRef,
            where('businessId', '==', businessId),
            where('active', '==', true)
          );
          const businessCouponsSnapshot = await getDocs(businessCouponsQuery);
          
          console.log(`Found ${businessCouponsSnapshot.size} business coupons for business ID: ${businessId}`);
          allDocs.push(...businessCouponsSnapshot.docs);
        } catch (error) {
          console.error(`Error fetching business coupons for business ${businessId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error getting coupons from phone number:', error);
  }
  
  return allDocs;
};

/**
 * Fetches all active coupons for businesses the user is connected to
 * @param userId The user ID
 * @returns Array of coupon documents
 */
const fetchBusinessCoupons = async (userId: string) => {
  const allDocs = [];
  
  try {
    // First, try to find the customer profile to get the business connections
    const linkedCustomer = await findCustomerByUserId(userId);
    
    if (linkedCustomer) {
      const businessIds: string[] = [];
      
      // Add the business ID from the customer record
      if (linkedCustomer.businessId) {
        businessIds.push(linkedCustomer.businessId);
      }
      
      // Check for any additional business connections in customer data
      // Note: We're using a type-safe approach to check for optional fields
      const customerData = linkedCustomer as any; // Use 'any' for flexible property access
      
      if (customerData && 
          customerData.visitedBusinesses && 
          Array.isArray(customerData.visitedBusinesses)) {
        businessIds.push(...customerData.visitedBusinesses);
      }
      
      // Remove duplicates (using filter instead of Set for better compatibility)
      const uniqueBusinessIds = businessIds.filter((id, index, self) => 
        self.indexOf(id) === index
      );
      
      console.log(`Found ${uniqueBusinessIds.length} businesses connected to user ${userId}`);
      
      // For each business, fetch active coupons
      for (const businessId of uniqueBusinessIds) {
        try {
          const couponsRef = collection(db, 'coupons');
          const couponsQuery = query(
            couponsRef,
            where('businessId', '==', businessId),
            where('active', '==', true)
          );
          
          const couponsSnapshot = await getDocs(couponsQuery);
          console.log(`Found ${couponsSnapshot.size} active coupons for business ${businessId}`);
          
          allDocs.push(...couponsSnapshot.docs);
        } catch (error) {
          console.error(`Error fetching coupons for business ${businessId}:`, error);
        }
      }
    } else {
      console.log(`No linked customer found for user ${userId}`);
    }
    
    // If no business coupons were found through customer links, try to fetch public coupons
    if (allDocs.length === 0) {
      try {
        // Fetch public coupons (those marked as available to all users)
        const publicCouponsRef = collection(db, 'coupons');
        const publicCouponsQuery = query(
          publicCouponsRef,
          where('isPublic', '==', true),
          where('active', '==', true),
          limit(10)
        );
        
        const publicCouponsSnapshot = await getDocs(publicCouponsQuery);
        console.log(`Found ${publicCouponsSnapshot.size} public coupons`);
        
        allDocs.push(...publicCouponsSnapshot.docs);
      } catch (error) {
        console.error('Error fetching public coupons:', error);
      }
    }
  } catch (error) {
    console.error(`Error fetching business coupons for user ${userId}:`, error);
  }
  
  return allDocs;
};