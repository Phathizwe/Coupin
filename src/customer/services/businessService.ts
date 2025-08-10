import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
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
  
  return stores;
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