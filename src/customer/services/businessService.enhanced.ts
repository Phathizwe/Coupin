import { collection, query, where, getDocs, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Business } from '../types/store';

/**
 * Fetches business details for a set of business IDs
 * @param businessIds Set of business IDs to fetch details for
 * @returns Array of Business objects with details
 */
export const fetchBusinessDetails = async (businessIds: Set<string>): Promise<Business[]> => {
  const stores: Business[] = [];
  // Convert Set to Array before iterating
  const businessIdArray = Array.from(businessIds);
  
  for (const businessId of businessIdArray) {
    console.log(`Fetching details for business: ${businessId}`);
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    
    if (businessDoc.exists()) {
      const businessData = businessDoc.data();
      
      // Count active coupons for this business
      const activeCouponCount = await countActiveCoupons(businessId);
      
      stores.push({
        id: businessId,
        businessName: businessData.businessName || 'Unknown Business',
        industry: businessData.industry || 'Not specified',
        logo: businessData.logo || undefined,
        description: businessData.description || '',
        address: businessData.address || '',
        couponCount: activeCouponCount,
        colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
      
      console.log(`Added store: ${businessData.businessName} with ${activeCouponCount} coupons`);
    } else {
      console.log(`Business document not found for ID: ${businessId}`);
    }
  }
  
  // If no stores were found or businessIds was empty, fetch some default businesses
  if (stores.length === 0) {
    console.log('No stores found, fetching default businesses');
    const defaultStores = await fetchDefaultBusinesses();
    stores.push(...defaultStores);
  }
  
  return stores;
};

/**
 * Fetches a list of default businesses when no specific businesses are found
 * This ensures users always see some businesses, even if they haven't interacted with any
 * @returns Array of Business objects
 */
export const fetchDefaultBusinesses = async (): Promise<Business[]> => {
  try {
    console.log('Fetching default businesses');
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      orderBy('businessName'),
      limit(10)
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const stores: Business[] = [];
    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      const businessId = businessDoc.id;
      
      // Count active coupons for this business
      const activeCouponCount = await countActiveCoupons(businessId);
      
      stores.push({
        id: businessId,
        businessName: businessData.businessName || 'Unknown Business',
        industry: businessData.industry || 'Not specified',
        logo: businessData.logo || undefined,
        description: businessData.description || '',
        address: businessData.address || '',
        couponCount: activeCouponCount,
        colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    console.log(`Fetched ${stores.length} default businesses`);
    return stores;
  } catch (error) {
    console.error('Error fetching default businesses:', error);
    return [];
  }
};

/**
 * Counts active coupons for a business
 * @param businessId The business ID to count coupons for
 * @returns Number of active coupons
 */
export const countActiveCoupons = async (businessId: string): Promise<number> => {
  const couponsRef = collection(db, 'coupons');
  const couponsQuery = query(
    couponsRef,
    where('businessId', '==', businessId),
    where('active', '==', true)
  );
  const couponsSnapshot = await getDocs(couponsQuery);
  
  return couponsSnapshot.size;
};

/**
 * Fetches a single business by ID
 * @param businessId The business ID to fetch
 * @returns Business object or null if not found
 */
export const fetchBusinessById = async (businessId: string): Promise<Business | null> => {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    
    if (!businessDoc.exists()) {
      return null;
    }
    
    const businessData = businessDoc.data();
    const activeCouponCount = await countActiveCoupons(businessId);
    
    return {
      id: businessId,
      businessName: businessData.businessName || 'Unknown Business',
      industry: businessData.industry || 'Not specified',
      logo: businessData.logo || undefined,
      description: businessData.description || '',
      address: businessData.address || '',
      couponCount: activeCouponCount,
      colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
    };
  } catch (error) {
    console.error('Error fetching business by ID:', error);
    return null;
  }
};

/**
 * Searches for businesses by name
 * @param searchTerm The search term to look for
 * @returns Array of matching businesses
 */
export const searchBusinessesByName = async (searchTerm: string): Promise<Business[]> => {
  try {
    console.log(`Searching for businesses with name: ${searchTerm}`);
    
    // If search term is empty, return some default businesses
    if (!searchTerm.trim()) {
      return await fetchDefaultBusinesses();
    }
    
    // Firestore doesn't support native text search, so we'll fetch all businesses
    // and filter them client-side
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      limit(50) // Limit to 50 businesses for performance
    );
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const searchTermLower = searchTerm.toLowerCase();
    const matchingBusinesses: Business[] = [];
    
    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      const businessName = (businessData.businessName || '').toLowerCase();
      
      if (businessName.includes(searchTermLower)) {
        const businessId = businessDoc.id;
        const activeCouponCount = await countActiveCoupons(businessId);
        
        matchingBusinesses.push({
          id: businessId,
          businessName: businessData.businessName || 'Unknown Business',
          industry: businessData.industry || 'Not specified',
          logo: businessData.logo || undefined,
          description: businessData.description || '',
          address: businessData.address || '',
          couponCount: activeCouponCount,
          colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' }
        });
      }
    }
    
    console.log(`Found ${matchingBusinesses.length} businesses matching "${searchTerm}"`);
    return matchingBusinesses;
  } catch (error) {
    console.error('Error searching businesses by name:', error);
    return [];
  }
};