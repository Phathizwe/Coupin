import { 
  doc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import { BusinessProfile } from '../types';

// Get business profile
export const getBusinessProfile = async (businessId: string) => {
  try {
    const docRef = doc(db, 'businesses', businessId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as BusinessProfile;
      return {
        ...data,
        subscriptionExpiry: data.subscriptionExpiry instanceof Timestamp 
          ? data.subscriptionExpiry.toDate() 
          : data.subscriptionExpiry
      };
    } else {
      throw new Error('Business profile not found');
    }
  } catch (error) {
    console.error('Error getting business profile:', error);
    throw error;
  }
};

// Update business profile
export const updateBusinessProfile = async (
  businessId: string, 
  updates: Partial<BusinessProfile>
) => {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    
    await updateDoc(businessRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating business profile:', error);
    throw error;
  }
};

// Upload business logo
export const uploadBusinessLogo = async (businessId: string, file: File) => {
  try {
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `logos/${businessId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update business profile with new logo URL
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      logo: downloadURL,
      updatedAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading business logo:', error);
    throw error;
  }
};

// Get business subscription details
export const getBusinessSubscription = async (businessId: string) => {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    const businessDoc = await getDoc(businessRef);
    
    if (!businessDoc.exists()) {
      throw new Error('Business not found');
    }
    
    const data = businessDoc.data();
    
    return {
      tier: data.subscriptionTier,
      status: data.subscriptionStatus,
      expiry: data.subscriptionExpiry instanceof Timestamp 
        ? data.subscriptionExpiry.toDate() 
        : data.subscriptionExpiry
    };
  } catch (error) {
    console.error('Error getting business subscription:', error);
    throw error;
  }
};