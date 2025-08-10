import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, UploadResult } from 'firebase/storage';

// Business Profile Types
export interface BusinessProfile {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  updatedAt?: any;
}

// Branding Settings Types
export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  updatedAt?: any;
}

// Notification Preferences Types
export interface NotificationPreferences {
  email: {
    newOrders: boolean;
    orderUpdates: boolean;
    marketing: boolean;
    systemUpdates: boolean;
  };
  push: {
    newOrders: boolean;
    orderUpdates: boolean;
    marketing: boolean;
    systemUpdates: boolean;
  };
  sms: {
    newOrders: boolean;
    orderUpdates: boolean;
    marketing: boolean;
  };
  updatedAt?: any;
}

// Security Settings Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  updatedAt?: any;
}

// Get business profile
export const getBusinessProfile = async (businessId: string): Promise<BusinessProfile> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'profile');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as BusinessProfile;
    } else {
      // Return default profile if none exists
      return {
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        website: ''
      };
    }
  } catch (error) {
    console.error('Error getting business profile:', error);
    throw error;
  }
};

// Update business profile
export const updateBusinessProfile = async (businessId: string, profile: BusinessProfile): Promise<void> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'profile');
    
    // Add timestamp
    const profileWithTimestamp = {
      ...profile,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, profileWithTimestamp, { merge: true });

    // Update the main business document for customer-facing pages
    const businessDocRef = doc(db, 'businesses', businessId);
    await updateDoc(businessDocRef, {
      businessName: profile.name,
      description: profile.description,
      address: profile.address,
      phone: profile.phone,
      website: profile.website,
      email: profile.email,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating business profile:', error);
    throw error;
  }
};

// Get branding settings
export const getBrandingSettings = async (businessId: string): Promise<BrandingSettings> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'branding');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as BrandingSettings;
    } else {
      // Return default branding if none exists
      return {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logoUrl: ''
      };
    }
  } catch (error) {
    console.error('Error getting branding settings:', error);
    throw error;
  }
};

// Helper function to upload file with retry logic and CORS handling
const uploadFileWithRetry = async (
  file: File,
  storagePath: string,
  maxRetries = 3
): Promise<string> => {
  let lastError;
  
  // Try to upload with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create a storage reference with a unique name based on timestamp
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `${storagePath}/${fileName}`);
      
      // Add metadata to help with CORS
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'origin': window.location.origin,
          'uploaded-from': 'business-settings'
        }
      };
      
      // Upload the file with metadata
      const snapshot: UploadResult = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Create a cachebuster URL to avoid CORS issues when retrieving the image
      const cacheBuster = new Date().getTime();
      const urlWithCacheBuster = `${downloadURL}?cacheBuster=${cacheBuster}`;
      
      return downloadURL;
    } catch (error: any) {
      console.error(`Upload attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        // Exponential backoff: wait longer with each retry
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Failed to upload file after multiple attempts');
};

// Update branding settings
export const updateBrandingSettings = async (
  businessId: string, 
  branding: BrandingSettings, 
  logoFile?: File
): Promise<void> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'branding');
    let brandingToSave = { ...branding };
    
    // If a new logo was uploaded, store it in Firebase Storage
    if (logoFile) {
      try {
        console.log('Uploading logo file:', logoFile.name, logoFile.type, logoFile.size);
        
        // Use data URL as a fallback if Firebase Storage upload fails
        let logoUrl = '';
        
        try {
          // Try Firebase Storage upload first
          logoUrl = await uploadFileWithRetry(
            logoFile,
            `businesses/${businessId}/logos`
          );
          console.log('Logo uploaded successfully to Firebase Storage:', logoUrl);
        } catch (uploadError) {
          console.error('Firebase Storage upload failed, using data URL fallback');
          
          // Fallback to data URL for development
          const reader = new FileReader();
          logoUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(logoFile);
          });
          
          console.log('Using data URL as fallback (truncated):', logoUrl.substring(0, 50) + '...');
        }
        
        brandingToSave.logoUrl = logoUrl;
      } catch (uploadError: any) {
        console.error('Error uploading logo:', uploadError);
        
        // Throw a more user-friendly error
        if (uploadError.code === 'storage/retry-limit-exceeded') {
          throw new Error('Upload timed out. Please check your connection and try again with a smaller image.');
        } else {
          throw new Error(`Failed to upload logo: ${uploadError.message || 'Unknown error'}`);
        }
      }
    }
    
    // Add timestamp
    const brandingWithTimestamp = {
      ...brandingToSave,
      updatedAt: serverTimestamp()
    };
    
    // Save to Firestore
    await setDoc(docRef, brandingWithTimestamp, { merge: true });
    
    // Update the main business document with the branding colors and logo
    const businessDocRef = doc(db, 'businesses', businessId);
    await updateDoc(businessDocRef, {
      colors: {
        primary: brandingToSave.primaryColor,
        secondary: brandingToSave.secondaryColor
      },
      logo: brandingToSave.logoUrl,
      updatedAt: serverTimestamp()
    });
    
    console.log('Branding settings updated successfully');
    
  } catch (error) {
    console.error('Error updating branding settings:', error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async (businessId: string): Promise<NotificationPreferences> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'notifications');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as NotificationPreferences;
    } else {
      // Return default notification preferences if none exists
      return {
        email: {
          newOrders: true,
          orderUpdates: true,
          marketing: false,
          systemUpdates: true
        },
        push: {
          newOrders: true,
          orderUpdates: true,
          marketing: false,
          systemUpdates: false
        },
        sms: {
          newOrders: false,
          orderUpdates: false,
          marketing: false
        }
      };
    }
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (
  businessId: string, 
  preferences: NotificationPreferences
): Promise<void> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'notifications');
    
    // Add timestamp
    const preferencesWithTimestamp = {
      ...preferences,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, preferencesWithTimestamp, { merge: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Get security settings
export const getSecuritySettings = async (businessId: string): Promise<SecuritySettings> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'security');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SecuritySettings;
    } else {
      // Return default security settings if none exists
      return {
        twoFactorEnabled: false,
        sessionTimeout: 30
      };
    }
  } catch (error) {
    console.error('Error getting security settings:', error);
    throw error;
  }
};

// Update security settings
export const updateSecuritySettings = async (
  businessId: string, 
  settings: SecuritySettings
): Promise<void> => {
  try {
    const docRef = doc(db, 'businesses', businessId, 'settings', 'security');
    
    // Add timestamp
    const settingsWithTimestamp = {
      ...settings,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, settingsWithTimestamp, { merge: true });
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
};