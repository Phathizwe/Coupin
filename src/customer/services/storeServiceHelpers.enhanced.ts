import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Gets business IDs from all relevant collections for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @param customerPhone Optional customer phone number for additional lookup
 * @returns Set of unique business IDs
 */
export const getBusinessIdsFromCollections = async (
  idsToSearch: string[], 
  customerPhone?: string
): Promise<Set<string>> => {
  const businessIds = new Set<string>();
  
  // First, get all active businesses
  await getAllActiveBusinessIds(businessIds);
  
  // Then check couponDistributions collection
  await getBusinessIdsFromDistributions(idsToSearch, businessIds);
  
  // Check customerCoupons collection
  await getBusinessIdsFromCustomerCoupons(idsToSearch, businessIds);
  
  // Get business IDs directly from coupons collection
  await getBusinessIdsFromCoupons(idsToSearch, businessIds);
  
  // Check for phone-based distributions if phone is provided
  if (customerPhone) {
    await getBusinessIdsFromPhoneNumber(customerPhone, businessIds);
  }
  
  return businessIds;
};

/**
 * Gets all active business IDs
 * This is crucial for store discovery - we want to show all businesses
 * @param businessIds Set to add business IDs to
 */
const getAllActiveBusinessIds = async (
  businessIds: Set<string>
): Promise<void> => {
  try {
    console.log('Fetching all active businesses');
    
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      limit(50) // Limit to 50 businesses for performance
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    
    console.log(`Found ${businessesSnapshot.size} active businesses`);
    
    // Extract business IDs
    businessesSnapshot.forEach(doc => {
      businessIds.add(doc.id);
    });
  } catch (error) {
    console.error('Error fetching active businesses:', error);
  }
};

/**
 * Gets business IDs from couponDistributions collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @param businessIds Set to add business IDs to
 */
const getBusinessIdsFromDistributions = async (
  idsToSearch: string[], 
  businessIds: Set<string>
): Promise<void> => {
  for (const id of idsToSearch) {
    console.log(`Checking couponDistributions for ID: ${id}`);
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('customerId', '==', id)
    );
    const distributionsSnapshot = await getDocs(distributionsQuery);
    
    console.log(`Found ${distributionsSnapshot.size} distributions for ID: ${id}`);
    
    // Extract business IDs
    distributionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        businessIds.add(data.businessId);
      }
    });
  }
};

/**
 * Gets business IDs from customerCoupons collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @param businessIds Set to add business IDs to
 */
const getBusinessIdsFromCustomerCoupons = async (
  idsToSearch: string[], 
  businessIds: Set<string>
): Promise<void> => {
  for (const id of idsToSearch) {
    console.log(`Checking customerCoupons for ID: ${id}`);
    
    // Query 1: Check for customerId
    const customerCouponsRef1 = collection(db, 'customerCoupons');
    const customerIdQuery = query(
      customerCouponsRef1,
      where('customerId', '==', id)
    );
    const customerIdSnapshot = await getDocs(customerIdQuery);
    console.log(`Found ${customerIdSnapshot.size} customer coupons with customerId: ${id}`);
    
    // Extract business IDs from customerId query
    customerIdSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        businessIds.add(data.businessId);
      }
    });
    
    // Query 2: Check for userId
    const customerCouponsRef2 = collection(db, 'customerCoupons');
    const userIdQuery = query(
      customerCouponsRef2,
      where('userId', '==', id)
    );
    const userIdSnapshot = await getDocs(userIdQuery);
    console.log(`Found ${userIdSnapshot.size} customer coupons with userId: ${id}`);
    
    // Extract business IDs from userId query
    userIdSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        businessIds.add(data.businessId);
      }
    });
  }
};

/**
 * Gets business IDs directly from the coupons collection
 * @param idsToSearch Array of user and customer IDs to search for
 * @param businessIds Set to add business IDs to
 */
const getBusinessIdsFromCoupons = async (
  idsToSearch: string[],
  businessIds: Set<string>
): Promise<void> => {
  // First get all coupon IDs associated with the user
  const couponIds = new Set<string>();
  
  // Check couponDistributions for coupon IDs
  for (const id of idsToSearch) {
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('customerId', '==', id)
    );
    const distributionsSnapshot = await getDocs(distributionsQuery);
    
    distributionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.couponId) {
        couponIds.add(data.couponId);
      }
    });
  }
  
  // Check customerCoupons for coupon IDs
  for (const id of idsToSearch) {
    // Query for customerId
    const customerCouponsRef1 = collection(db, 'customerCoupons');
    const customerCouponsQuery1 = query(
      customerCouponsRef1,
      where('customerId', '==', id)
    );
    const customerCouponsSnapshot1 = await getDocs(customerCouponsQuery1);
    
    customerCouponsSnapshot1.forEach(doc => {
      const data = doc.data();
      if (data.couponId) {
        couponIds.add(data.couponId);
      }
    });
    
    // Query for userId
    const customerCouponsRef2 = collection(db, 'customerCoupons');
    const customerCouponsQuery2 = query(
      customerCouponsRef2,
      where('userId', '==', id)
    );
    const customerCouponsSnapshot2 = await getDocs(customerCouponsQuery2);
    
    customerCouponsSnapshot2.forEach(doc => {
      const data = doc.data();
      if (data.couponId) {
        couponIds.add(data.couponId);
      }
    });
  }
  
  console.log(`Found ${couponIds.size} total coupon IDs`);
  
  // Now get the business IDs for each coupon
  if (couponIds.size > 0) {
    const couponIdsArray = Array.from(couponIds);
    
    // Process in batches of 10 to avoid exceeding Firestore limits
    const batchSize = 10;
    for (let i = 0; i < couponIdsArray.length; i += batchSize) {
      const batch = couponIdsArray.slice(i, i + batchSize);
      
      for (const couponId of batch) {
        const couponRef = collection(db, 'coupons');
        const couponQuery = query(
          couponRef,
          where('__name__', '==', couponId)
        );
        const couponSnapshot = await getDocs(couponQuery);
        
        couponSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.businessId) {
            businessIds.add(data.businessId);
          }
        });
      }
    }
  }
};

/**
 * Gets business IDs from distributions linked to a phone number
 * This is crucial for finding stores that have given coupons to a customer
 * based on phone number matching
 * @param phone The customer's phone number
 * @param businessIds Set to add business IDs to
 */
const getBusinessIdsFromPhoneNumber = async (
  phone: string,
  businessIds: Set<string>
): Promise<void> => {
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
    
    // For each customer with this phone number, find associated businesses
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
      
      // Extract business IDs
      distributionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.businessId) {
          businessIds.add(data.businessId);
          console.log(`Added business ID from phone lookup: ${data.businessId}`);
        }
      });
      
      // Check customer coupons for this customer
      const customerCouponsRef = collection(db, 'customerCoupons');
      const customerCouponsQuery = query(
        customerCouponsRef,
        where('customerId', '==', phoneCustomerId)
      );
      const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
      
      console.log(`Found ${customerCouponsSnapshot.size} customer coupons for phone-linked customer ID: ${phoneCustomerId}`);
      
      // Extract business IDs
      customerCouponsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.businessId) {
          businessIds.add(data.businessId);
          console.log(`Added business ID from phone lookup: ${data.businessId}`);
        }
      });
    }
  } catch (error) {
    console.error('Error getting business IDs from phone number:', error);
  }
};