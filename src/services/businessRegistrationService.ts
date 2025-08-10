import { doc, collection, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAnalyticsEvent } from '../config/firebase';

/**
 * Interface for business registration data
 */
export interface BusinessRegistrationData {
  businessName: string;
  industry?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
}

/**
 * Creates a business document and links it to a user
 */
export const createBusinessForUser = async (
  userId: string, 
  data: BusinessRegistrationData
): Promise<string> => {
  try {
    console.log('[BusinessRegistration] Creating business for user:', userId);
    
    // Create a business document with a generated ID
    const businessRef = doc(collection(db, 'businesses'));
    const businessId = businessRef.id;
    
    // Prepare business data
    const businessData = {
      businessId,
      businessName: data.businessName || 'My Business',
      industry: data.industry || '',
      address: data.address || '',
      phone: data.phone || '',
      website: data.website || '',
      description: data.description || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ownerId: userId,
      active: true
    };
    
    // Create the business document
    await setDoc(businessRef, businessData);
    console.log('[BusinessRegistration] Created business document:', businessId);
    
    // Update user document with business reference
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      businessId,
      businesses: [businessId],
      currentBusinessId: businessId,
      updatedAt: serverTimestamp()
    });
    console.log('[BusinessRegistration] Updated user with business reference');
    
    // Log analytics event
    logAnalyticsEvent('business_created', {
      businessId,
      userId,
      hasIndustry: !!data.industry
    });
    
    return businessId;
  } catch (error: any) {
    console.error('[BusinessRegistration] Error creating business:', error);
    throw new Error(`Failed to create business: ${error?.message || 'Unknown error'}`);
  }
};

/**
 * Checks if a user already has a business and creates one if not
 */
export const ensureUserHasBusiness = async (
  userId: string,
  defaultName: string = 'My Business'
): Promise<string> => {
  try {
    // Check if user document exists and has business reference
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User document does not exist');
    }
    
    const userData = userDoc.data();
    
    // If user already has a business ID, return it
    if (userData.businessId) {
      console.log('[BusinessRegistration] User already has business:', userData.businessId);
      return userData.businessId;
    }
    
    // If user has businesses array but no businessId
    if (userData.businesses && userData.businesses.length > 0) {
      const businessId = userData.businesses[0];
      
      // Update user with the first business as current
      await updateDoc(doc(db, 'users', userId), {
        businessId,
        currentBusinessId: businessId,
        updatedAt: serverTimestamp()
      });
      
      console.log('[BusinessRegistration] Set existing business as current:', businessId);
      return businessId;
    }
    
    // No business found, create a new one
    console.log('[BusinessRegistration] No business found, creating new one');
    return await createBusinessForUser(userId, {
      businessName: userData.displayName || defaultName
    });
  } catch (error: any) {
    console.error('[BusinessRegistration] Error ensuring business:', error);
    throw new Error(`Failed to ensure business: ${error?.message || 'Unknown error'}`);
  }
};