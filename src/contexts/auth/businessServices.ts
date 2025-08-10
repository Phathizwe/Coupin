import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BusinessProfile } from '../../types';

// Fetch profiles for all businesses user belongs to
export const fetchBusinessProfiles = async (
  businessIds: string[], 
  currentBusinessId?: string
): Promise<{
  businessProfiles: BusinessProfile[],
  currentProfile: BusinessProfile | null
}> => {
  try {
    console.log('Fetching business profiles for:', businessIds);
    const businessProfiles: BusinessProfile[] = [];
    let currentProfile: BusinessProfile | null = null;
    
    for (const businessId of businessIds) {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId));
      if (businessDoc.exists()) {
        const businessData = businessDoc.data() as BusinessProfile;
        const profile = {
          ...businessData,
          businessId: businessDoc.id
        };
        
        businessProfiles.push(profile);
        
        // Set the current business profile
        if (businessId === currentBusinessId) {
          console.log('Found current business profile:', businessData);
          currentProfile = profile;
        }
      }
    }
    
    return { businessProfiles, currentProfile };
  } catch (error) {
    console.error('Error fetching business profiles:', error);
    return { businessProfiles: [], currentProfile: null };
  }
};

// Switch to a different business
export const switchBusiness = async (
  userId: string,
  businessId: string
): Promise<BusinessProfile | null> => {
  try {
    console.log('Switching to business:', businessId);
    // Update the current business ID in Firestore
    await updateDoc(doc(db, 'users', userId), {
      currentBusinessId: businessId,
      updatedAt: serverTimestamp()
    });
    
    // Get the business profile
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    if (businessDoc.exists()) {
      const businessData = businessDoc.data() as BusinessProfile;
      return {
        ...businessData,
        businessId: businessDoc.id
      };
    }
    return null;
  } catch (error) {
    console.error('Error switching business:', error);
    throw error;
  }
};