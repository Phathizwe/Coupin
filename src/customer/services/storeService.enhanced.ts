import { collection, query, where, getDocs, DocumentData, QueryDocumentSnapshot, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Business } from '../types/store';
import { findCustomerByUserId, findCustomerByPhone } from '../../services/customerLinkingService';
import { getBusinessIdsFromCollections } from './storeServiceHelpers.enhanced';
import { fetchBusinessDetails, searchBusinessesByName } from './businessService.enhanced';

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
 * Searches for stores by name
 * @param searchTerm The search term to use
 * @returns Array of matching businesses
 */
export const searchStores = async (searchTerm: string): Promise<Business[]> => {
  try {
    console.log(`Searching for stores with term: "${searchTerm}"`);
    return await searchBusinessesByName(searchTerm);
  } catch (error) {
    console.error('Error searching stores:', error);
    return [];
  }
};

/**
 * Fetches popular businesses
 * @param limit Optional limit on number of businesses to return
 * @returns Array of popular businesses
 */
export const fetchPopularBusinesses = async (limitCount: number = 10): Promise<Business[]> => {
  try {
    console.log('Fetching popular businesses');
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      orderBy('popularityScore', 'desc'),
      limit(limitCount)
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const businesses: Business[] = [];
    for (const doc of businessesSnapshot.docs) {
      const businessData = doc.data();
      businesses.push({
        id: doc.id,
        businessName: businessData.businessName || 'Unknown Business',
        industry: businessData.industry || 'Not specified',
        logo: businessData.logo || undefined,
        description: businessData.description || '',
        address: businessData.address || '',
        couponCount: businessData.couponCount || 0,
        colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    return businesses;
  } catch (error) {
    console.error('Error fetching popular businesses:', error);
    return [];
  }
};

/**
 * Fetches businesses with loyalty programs
 * @param limitCount Optional limit on number of businesses to return
 * @returns Array of businesses with loyalty programs
 */
export const fetchBusinessesWithLoyaltyPrograms = async (limitCount: number = 10): Promise<Business[]> => {
  try {
    console.log('Fetching businesses with loyalty programs');
    
    // First get all loyalty programs
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('active', '==', true),
      limit(limitCount * 2) // Get more than we need to account for duplicates
    );
    const programsSnapshot = await getDocs(programsQuery);
    
    // Extract unique business IDs
    const businessIdSet = new Set<string>();
    programsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        businessIdSet.add(data.businessId);
      }
    });
    
    // Convert Set to Array for compatibility
    const businessIds = Array.from(businessIdSet);
    
    // Fetch business details for each ID
    const businesses: Business[] = [];
    for (const businessId of businessIds) {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      if (businessDoc.exists()) {
        const businessData = businessDoc.data();
        businesses.push({
          id: businessId,
          businessName: businessData.businessName || 'Unknown Business',
          industry: businessData.industry || 'Not specified',
          logo: businessData.logo || undefined,
          description: businessData.description || '',
          address: businessData.address || '',
          couponCount: businessData.couponCount || 0,
          colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
        });
      }
    }
    
    // Limit the number of businesses returned
    return businesses.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching businesses with loyalty programs:', error);
    return [];
  }
};

/**
 * Fetches businesses by industry
 * @param industry The industry to filter by
 * @param limitCount Optional limit on number of businesses to return
 * @returns Array of businesses in the specified industry
 */
export const fetchBusinessesByIndustry = async (industry: string, limitCount: number = 10): Promise<Business[]> => {
  try {
    console.log(`Fetching businesses in industry: ${industry}`);
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      where('industry', '==', industry),
      limit(limitCount)
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const businesses: Business[] = [];
    for (const doc of businessesSnapshot.docs) {
      const businessData = doc.data();
      businesses.push({
        id: doc.id,
        businessName: businessData.businessName || 'Unknown Business',
        industry: businessData.industry || 'Not specified',
        logo: businessData.logo || undefined,
        description: businessData.description || '',
        address: businessData.address || '',
        couponCount: businessData.couponCount || 0,
        colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    return businesses;
  } catch (error) {
    console.error(`Error fetching businesses in industry ${industry}:`, error);
    return [];
  }
};

/**
 * Searches for businesses
 * @param searchTerm The search term to use
 * @returns Array of matching businesses
 */
export const searchBusinesses = async (searchTerm: string): Promise<Business[]> => {
  return searchBusinessesByName(searchTerm);
};

/**
 * Gets loyalty programs for a business
 * @param businessId The business ID to get programs for
 * @returns Array of loyalty programs
 */
export const getBusinessPrograms = async (businessId: string): Promise<any[]> => {
  try {
    console.log(`Fetching loyalty programs for business: ${businessId}`);
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    const programsSnapshot = await getDocs(programsQuery);
    
    const programs: any[] = [];
    programsSnapshot.forEach(doc => {
      programs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return programs;
  } catch (error) {
    console.error('Error fetching business programs:', error);
    return [];
  }
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
        where('customerId', '==', id),
        where('businessId', '==', businessId)
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
          where('customerId', '==', phoneCustomerId),
          where('businessId', '==', businessId)
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