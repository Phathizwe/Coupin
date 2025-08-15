import { collection, query, where, getDocs, orderBy, limit, startAt, endAt, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Business } from '../customer/types/store';

/**
 * Enhanced business discovery service
 * This service provides robust methods for discovering businesses
 * and addresses the critical store discovery failure issue
 */

/**
 * Searches for businesses by name with case-insensitive matching
 * This is the critical function for store discovery
 */
export const searchBusinessesByName = async (searchTerm: string): Promise<Business[]> => {
  try {
    console.log(`Searching for businesses with name: "${searchTerm}"`);
    
    if (!searchTerm.trim()) {
      return await getDefaultBusinesses();
    }
    
    // For case-insensitive search, we'll use startAt and endAt with capitalized search term
    const searchTermLower = searchTerm.toLowerCase();
    const searchTermUpper = searchTerm.toUpperCase();
    
    // First try exact name search (case insensitive)
    const businessesRef = collection(db, 'businesses');
    const exactQuery = query(
      businessesRef,
      where('businessNameLower', '>=', searchTermLower),
      where('businessNameLower', '<=', searchTermLower + '\uf8ff'),
      limit(20)
    );
    
    let businessesSnapshot = await getDocs(exactQuery);
    
    // If no results, try partial match
    if (businessesSnapshot.empty) {
      console.log('No exact matches, trying partial match');
      
      // Get all active businesses for client-side filtering
      const allBusinessesQuery = query(
        businessesRef,
        where('active', '==', true),
        limit(100)
      );
      
      businessesSnapshot = await getDocs(allBusinessesQuery);
    }
    
    // Process results
    const businesses: Business[] = [];
    const searchTermLowerCase = searchTerm.toLowerCase();
    
    businessesSnapshot.forEach(doc => {
      const data = doc.data();
      const businessName = data.businessName || '';
      
      // Client-side filtering for more flexible matching
      if (businessName.toLowerCase().includes(searchTermLowerCase)) {
        businesses.push({
          id: doc.id,
          businessName: data.businessName || 'Unknown Business',
          industry: data.industry || 'Not specified',
          logo: data.logo || undefined,
          description: data.description || '',
          address: data.address || '',
          couponCount: 0, // We'll count these later
          colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
        });
      }
    });
    
    // Count active coupons for each business
    for (let i = 0; i < businesses.length; i++) {
      businesses[i].couponCount = await countActiveCoupons(businesses[i].id);
    }
    
    console.log(`Found ${businesses.length} businesses matching "${searchTerm}"`);
    return businesses;
  } catch (error) {
    console.error('Error searching businesses by name:', error);
    
    // Return some default businesses instead of empty results
    return getDefaultBusinesses();
  }
};

/**
 * Gets a list of default businesses to show when no search term is provided
 * or when an error occurs
 */
export const getDefaultBusinesses = async (): Promise<Business[]> => {
  try {
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const businesses: Business[] = [];
    for (const doc of businessesSnapshot.docs) {
      const data = doc.data();
      businesses.push({
        id: doc.id,
        businessName: data.businessName || 'Unknown Business',
        industry: data.industry || 'Not specified',
        logo: data.logo || undefined,
        description: data.description || '',
        address: data.address || '',
        couponCount: 0,
        colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    // Count active coupons for each business
    for (let i = 0; i < businesses.length; i++) {
      businesses[i].couponCount = await countActiveCoupons(businesses[i].id);
    }
    
    return businesses;
  } catch (error) {
    console.error('Error getting default businesses:', error);
    return [];
  }
};

/**
 * Counts active coupons for a business
 */
export const countActiveCoupons = async (businessId: string): Promise<number> => {
  try {
    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(
      couponsRef,
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    
    const couponsSnapshot = await getDocs(couponsQuery);
    return couponsSnapshot.size;
  } catch (error) {
    console.error(`Error counting coupons for business ${businessId}:`, error);
    return 0;
  }
};

/**
 * Gets a business by ID with detailed information
 */
export const getBusinessById = async (businessId: string): Promise<Business | null> => {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    
    if (!businessDoc.exists()) {
      console.log(`Business ${businessId} not found`);
      return null;
    }
    
    const data = businessDoc.data();
    const couponCount = await countActiveCoupons(businessId);
    
    return {
      id: businessId,
      businessName: data.businessName || 'Unknown Business',
      industry: data.industry || 'Not specified',
      logo: data.logo || undefined,
      description: data.description || '',
      address: data.address || '',
      couponCount,
      colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
    };
  } catch (error) {
    console.error(`Error getting business ${businessId}:`, error);
    return null;
  }
};

/**
 * Gets businesses by industry
 */
export const getBusinessesByIndustry = async (industry: string, limitCount: number = 10): Promise<Business[]> => {
  try {
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
      const data = doc.data();
      businesses.push({
        id: doc.id,
        businessName: data.businessName || 'Unknown Business',
        industry: data.industry || 'Not specified',
        logo: data.logo || undefined,
        description: data.description || '',
        address: data.address || '',
        couponCount: 0,
        colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    // Count active coupons for each business
    for (let i = 0; i < businesses.length; i++) {
      businesses[i].couponCount = await countActiveCoupons(businesses[i].id);
    }
    
    return businesses;
  } catch (error) {
    console.error(`Error getting businesses in industry ${industry}:`, error);
    return [];
  }
};

/**
 * Gets businesses with loyalty programs
 */
export const getBusinessesWithLoyaltyPrograms = async (limitCount: number = 10): Promise<Business[]> => {
  try {
    // Get all loyalty programs
    const programsRef = collection(db, 'loyaltyPrograms');
    const programsQuery = query(
      programsRef,
      where('active', '==', true)
    );
    
    const programsSnapshot = await getDocs(programsQuery);
    
    // Extract unique business IDs
    const businessIds = new Set<string>();
    programsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        businessIds.add(data.businessId);
      }
    });
    
    // Fetch business details
    const businesses: Business[] = [];
    const businessIdsArray = Array.from(businessIds);
    
    for (let i = 0; i < Math.min(businessIdsArray.length, limitCount); i++) {
      const businessId = businessIdsArray[i];
      const business = await getBusinessById(businessId);
      if (business) {
        businesses.push(business);
      }
    }
    
    return businesses;
  } catch (error) {
    console.error('Error getting businesses with loyalty programs:', error);
    return [];
  }
};

/**
 * Gets popular businesses based on customer interactions
 */
export const getPopularBusinesses = async (limitCount: number = 10): Promise<Business[]> => {
  try {
    // For now, we'll just get the most recently created businesses
    // In a real app, this would use analytics data
    const businessesRef = collection(db, 'businesses');
    const businessesQuery = query(
      businessesRef,
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const businessesSnapshot = await getDocs(businessesQuery);
    
    const businesses: Business[] = [];
    for (const doc of businessesSnapshot.docs) {
      const data = doc.data();
      businesses.push({
        id: doc.id,
        businessName: data.businessName || 'Unknown Business',
        industry: data.industry || 'Not specified',
        logo: data.logo || undefined,
        description: data.description || '',
        address: data.address || '',
        couponCount: 0,
        colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
      });
    }
    
    // Count active coupons for each business
    for (let i = 0; i < businesses.length; i++) {
      businesses[i].couponCount = await countActiveCoupons(businesses[i].id);
    }
    
    return businesses;
  } catch (error) {
    console.error('Error getting popular businesses:', error);
    return [];
  }
};