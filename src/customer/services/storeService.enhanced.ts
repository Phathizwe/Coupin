import { collection, query, where, getDocs, DocumentData, QueryDocumentSnapshot, getDoc, doc, and, or } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Business } from '../types/store';
import { findCustomerByUserId, findCustomerByPhone } from '../../services/customerLinkingService';
import { getBusinessIdsFromCollections } from './storeServiceHelpers';
import { fetchBusinessDetails } from './businessService';

const STORES_PER_PAGE = 12;

/**
 * Fetches initial set of stores for a user
 * @param userId The user ID to fetch stores for
 * @returns Object containing stores, last visible document, and whether there are more stores
 */
export const fetchInitialStores = async (userId: string): Promise<{
  stores: Business[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    console.log('Fetching stores for user:', userId);
    
    // First, check if the user is linked to a customer profile
    const linkedCustomer = await findCustomerByUserId(userId);
    const customerId = linkedCustomer?.id;
    const customerPhone = linkedCustomer?.phone;
    
    console.log('Linked customer ID:', customerId || 'Not linked');
    console.log('Linked customer phone:', customerPhone || 'No phone');
    
    // IDs to search in collections
    const idsToSearch = [userId];
    if (customerId) {
      idsToSearch.push(customerId);
    }
    
    // Get business IDs from all relevant collections
    const businessIds = await getBusinessIdsFromCollections(idsToSearch, customerPhone);
    console.log('Total unique business IDs found:', businessIds.size);
    
    // Fetch business details
    const stores = await fetchBusinessDetails(businessIds);
    console.log('Returning total stores:', stores.length);
    
    return {
      stores,
      lastVisible: null,
      hasMore: false // Pagination not implemented for simplicity
    };
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

/**
 * Fetches more stores for pagination
 * @param userId The user ID to fetch stores for
 * @param lastVisible The last visible document from the previous fetch
 * @returns Object containing stores, last visible document, and whether there are more stores
 */
export const fetchMoreStores = async (
  userId: string,
  lastVisible: QueryDocumentSnapshot<DocumentData>
): Promise<{
  stores: Business[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  // For now, we're loading all stores at once, so this is a placeholder
  return {
    stores: [],
    lastVisible: null,
    hasMore: false
  };
};

/**
 * Checks if a store is saved by a user
 * @param userId The user ID to check
 * @param businessId The business ID to check
 * @returns Boolean indicating whether the store is saved
 */
export const isStoreSaved = async (userId: string, businessId: string): Promise<boolean> => {
  try {
    // First, check if the user is linked to a customer profile
    const linkedCustomer = await findCustomerByUserId(userId);
    const customerId = linkedCustomer?.id;
    const customerPhone = linkedCustomer?.phone;
    
    // If we have both IDs, we'll search using both
    const idsToSearch = [userId];
    if (customerId) {
      idsToSearch.push(customerId);
    }
    
    // Check in couponDistributions
    for (const id of idsToSearch) {
      const distributionsRef = collection(db, 'couponDistributions');
      const distributionsQuery = query(
        distributionsRef,
        and(
          where('customerId', '==', id),
          where('businessId', '==', businessId)
        )
      );
      const distributionsSnapshot = await getDocs(distributionsQuery);
      
      if (!distributionsSnapshot.empty) {
        return true;
      }
    }
    
    // Check in customerCoupons for customerId
    for (const id of idsToSearch) {
      const customerCouponsRef = collection(db, 'customerCoupons');
      const customerCouponsQuery = query(
        customerCouponsRef,
        where('customerId', '==', id),
        where('businessId', '==', businessId)
      );
      const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
      
      if (!customerCouponsSnapshot.empty) {
        return true;
      }
    }
    
    // Check in customerCoupons for userId
    for (const id of idsToSearch) {
      const customerCouponsRef = collection(db, 'customerCoupons');
      const customerCouponsQuery = query(
        customerCouponsRef,
        where('userId', '==', id),
        where('businessId', '==', businessId)
      );
      const customerCouponsSnapshot = await getDocs(customerCouponsQuery);
      
      if (!customerCouponsSnapshot.empty) {
        return true;
      }
    }
    
    // Check for phone-based coupon distributions if we have a phone number
    if (customerPhone) {
      // Find all customers with this phone number (there might be duplicates)
      const customersRef = collection(db, 'customers');
      const phoneQuery = query(
        customersRef,
        where('phone', '==', customerPhone)
      );
      const phoneCustomersSnapshot = await getDocs(phoneQuery);
      
      // Check coupon distributions for each customer with this phone
      for (const customerDoc of phoneCustomersSnapshot.docs) {
        const phoneCustomerId = customerDoc.id;
        
        const distributionsRef = collection(db, 'couponDistributions');
        const distributionsQuery = query(
          distributionsRef,
          and(
            where('customerId', '==', phoneCustomerId),
            where('businessId', '==', businessId)
          )
        );
        const distributionsSnapshot = await getDocs(distributionsQuery);
        
        if (!distributionsSnapshot.empty) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if store is saved:', error);
    return false;
  }
};