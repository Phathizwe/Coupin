import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Gets business IDs from all relevant collections for a list of user/customer IDs
 * @param idsToSearch Array of user and customer IDs to search for
 * @returns Set of unique business IDs
 */
export const getBusinessIdsFromCollections = async (idsToSearch: string[]): Promise<Set<string>> => {
  const businessIds = new Set<string>();
  
  // Check couponDistributions collection
  await getBusinessIdsFromDistributions(idsToSearch, businessIds);
  
  // Check customerCoupons collection
  await getBusinessIdsFromCustomerCoupons(idsToSearch, businessIds);
  
  // ADDED: Get business IDs directly from coupons collection
  await getBusinessIdsFromCoupons(idsToSearch, businessIds);
  
  return businessIds;
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
    const customerCouponsRef = collection(db, 'customerCoupons');
    
    // FIXED: Use separate queries for customerId and userId
    // Query 1: Check for customerId
    const customerIdQuery = query(
      customerCouponsRef,
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
    const userIdQuery = query(
      customerCouponsRef,
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
 * ADDED: Gets business IDs directly from the coupons collection
 * This ensures we find all businesses that have given you coupons
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