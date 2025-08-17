/**
 * Business service
 * Handles business-related operations
 */
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { BusinessProfile } from '../../../types';

/**
 * Fetch user businesses
 * 
 * @param userId User ID
 * @returns Array of business profiles
 */
export const fetchUserBusinesses = async (userId: string): Promise<BusinessProfile[]> => {
  try {
    console.log('🔍 [BUSINESS] Fetching businesses for user:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      console.log('⚠️ [BUSINESS] User document does not exist');
      return [];
    }

    const userData = userDoc.data();
    const businesses = userData.businesses || [];

    if (businesses.length === 0) {
      console.log('ℹ️ [BUSINESS] User has no businesses');
      return [];
    }

    console.log('🔍 [BUSINESS] Found businesses:', businesses);
    const businessProfiles: BusinessProfile[] = [];

    for (const businessId of businesses) {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));

      if (businessDoc.exists()) {
        const businessData = businessDoc.data();

        businessProfiles.push({
          businessId: businessId,
          businessName: businessData.businessName || '',
          industry: businessData.industry || '',
          address: businessData.address || '',
          phone: businessData.phone || '',
          website: businessData.website || '',
          logo: businessData.logo || '',
          colors: businessData.colors || { primary: '#3B82F6', secondary: '#10B981' },
          subscriptionTier: businessData.subscriptionTier || 'free',
          subscriptionStatus: businessData.subscriptionStatus || 'active'
        });
      }
    }

    console.log('✅ [BUSINESS] Fetched business profiles:', businessProfiles.length);
    return businessProfiles;
  } catch (error) {
    console.error('❌ [BUSINESS] Error fetching user businesses:', error);
    return [];
  }
};