import { collection, query, where, getDocs, DocumentData, QueryDocumentSnapshot, getDoc, doc, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Business } from '../types/store';
import { findCustomerByUserId } from '../../services/customerLinkingService';
import { getBusinessIdsFromCollections } from './storeServiceHelpers';
import { fetchBusinessDetails } from './businessService';

const STORES_PER_PAGE = 12;

/**
 * Search for businesses by name
 * @param searchTerm The search term to look for in business names
 * @returns Array of matching businesses
 */
export const searchBusinesses = async (searchTerm: string): Promise<Business[]> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    
    // Query businesses collection for matching names
    const businessesRef = collection(db, 'businesses');
    
    // Firebase doesn't support case-insensitive search directly,
    // so we use a range query with a lowercase field
    const q = query(
      businessesRef,
      where('businessNameLower', '>=', normalizedSearchTerm),
      where('businessNameLower', '<=', normalizedSearchTerm + '\uf8ff'),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    
    // Transform results into Business objects
    const businesses: Business[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      businesses.push({
        id: doc.id,
        name: data.businessName || '',
        description: data.description || '',
        logo: data.logo || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        industry: data.industry || '',
        saved: false // Will be updated later
      });
    });
    
    return businesses;
  } catch (error) {
    console.error('Error searching businesses:', error);
    throw error;
  }
};

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
 * Fetches popular or featured businesses
 * @returns Array of popular businesses
 */
export const fetchPopularBusinesses = async (): Promise<Business[]> => {
  try {
    // First try to fetch featured businesses
    const businessesRef = collection(db, 'businesses');
    const featuredQuery = query(
      businessesRef,
      where('featured', '==', true),
      limit(10)
    );
    
    const featuredSnapshot = await getDocs(featuredQuery);
    
    // If we don't have enough featured businesses, find businesses with loyalty programs
    if (featuredSnapshot.size < 5) {
      // Find businesses that have loyalty programs
      const programsRef = collection(db, 'loyaltyPrograms');
      const programsQuery = query(
        programsRef,
        where('active', '==', true),
        limit(20)
      );
      
      const programsSnapshot = await getDocs(programsQuery);
      
      // Get unique business IDs
      const businessIds = new Set<string>();
      programsSnapshot.forEach(doc => {
        const businessId = doc.data().businessId;
        if (businessId) {
          businessIds.add(businessId);
        }
      });
      
      // Fetch details for these businesses
      const businesses: Business[] = [];
      
      // Convert Set to Array to avoid iteration issues
      const businessIdArray = Array.from(businessIds);
      
      for (const businessId of businessIdArray) {
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          businesses.push({
            id: businessDoc.id,
            name: data.businessName || '',
            description: data.description || '',
            logo: data.logo || '',
            address: data.address || '',
            phone: data.phone || '',
            website: data.website || '',
            industry: data.industry || '',
            hasLoyaltyProgram: true,
            saved: false
          });
        }
        
        // Limit to 10 businesses
        if (businesses.length >= 10) {
          break;
        }
      }
      
      return businesses;
    }
    
    // Transform featured businesses into Business objects
    const businesses: Business[] = [];
    
    featuredSnapshot.forEach(doc => {
      const data = doc.data();
      businesses.push({
        id: doc.id,
        name: data.businessName || '',
        description: data.description || '',
        logo: data.logo || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        industry: data.industry || '',
        saved: false
      });
    });
    
    return businesses;
  } catch (error) {
    console.error('Error fetching popular businesses:', error);
    return [];
  }
};

/**
 * Gets all loyalty programs for a business
 * @param businessId The business ID
 * @returns Array of loyalty programs
 */
export const getBusinessPrograms = async (businessId: string) => {
  try {
    const programsRef = collection(db, 'loyaltyPrograms');
    const q = query(
      programsRef,
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting business programs:', error);
    throw error;
  }
};

/**
 * Fetches businesses with loyalty programs
 * @param limit Number of businesses to fetch
 * @returns Array of businesses with loyalty programs
 */
export const fetchBusinessesWithLoyaltyPrograms = async (limitCount = 10): Promise<Business[]> => {
  try {
    // Find businesses that have loyalty programs
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('active', '==', true),
      limit(limitCount * 2) // Fetch more to account for duplicates
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    
    // Get unique business IDs
    const businessIds = new Set<string>();
    programsSnapshot.forEach(doc => {
      const businessId = doc.data().businessId;
      if (businessId) {
        businessIds.add(businessId);
      }
    });
    
    // Fetch details for these businesses
    const businesses: Business[] = [];
    
    // Convert Set to Array to avoid iteration issues
    const businessIdArray = Array.from(businessIds);
    
    for (const businessId of businessIdArray) {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      
      if (businessDoc.exists()) {
        const data = businessDoc.data();
        businesses.push({
          id: businessDoc.id,
          name: data.businessName || '',
          description: data.description || '',
          logo: data.logo || '',
          address: data.address || '',
          phone: data.phone || '',
          website: data.website || '',
          industry: data.industry || '',
          hasLoyaltyProgram: true,
          saved: false
        });
      }
      
      // Limit to requested number of businesses
      if (businesses.length >= limitCount) {
        break;
      }
    }
    
    return businesses;
  } catch (error) {
    console.error('Error fetching businesses with loyalty programs:', error);
    return [];
  }
};

/**
 * Fetches businesses by industry
 * @param industry The industry to filter by
 * @param limitCount Number of businesses to fetch
 * @returns Array of businesses in the specified industry
 */
export const fetchBusinessesByIndustry = async (industry: string, limitCount = 10): Promise<Business[]> => {
  try {
    const businessesRef = collection(db, 'businesses');
    const q = query(
      businessesRef,
      where('industry', '==', industry),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    // Transform results into Business objects
    const businesses: Business[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      businesses.push({
        id: doc.id,
        name: data.businessName || '',
        description: data.description || '',
        logo: data.logo || '',
        address: data.address || '',
        phone: data.phone || '',
        website: data.website || '',
        industry: data.industry || '',
        saved: false
      });
    });
    
    return businesses;
  } catch (error) {
    console.error(`Error fetching businesses by industry ${industry}:`, error);
    return [];
  }
};