import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserRegionalPreferences, USER_PREFERENCES_COLLECTION } from './types';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Service for managing user regional preferences
 */
class UserPreferencesService {
  /**
   * Save user regional preferences
   */
  async saveUserPreferences(
    userId: string, 
    preferences: { 
      region: string; 
      currency: string; 
      dateFormat?: string; 
      timeFormat?: string; 
    }
  ): Promise<boolean> {
    // For development, simulate successful save
    if (isDevelopment) {
      console.log('Development mode: User preferences saved to localStorage');
      try {
        // In development, store in localStorage for persistence
        localStorage.setItem(`userPrefs_${userId}`, JSON.stringify({
          userId,
        region: preferences.region,
        currency: preferences.currency,
          dateFormat: preferences.dateFormat || 'yyyy-MM-dd',
          timeFormat: preferences.timeFormat || 'HH:mm:ss',
          updatedAt: new Date().toISOString()
        }));
      return true;
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      return false;
    }
  }

    try {
      const userPrefRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
      
      // Set default formats if not provided
      const dateFormat = preferences.dateFormat || 'yyyy-MM-dd';
      const timeFormat = preferences.timeFormat || 'HH:mm:ss';
      
      await setDoc(userPrefRef, {
        userId,
        region: preferences.region,
        currency: preferences.currency,
        dateFormat,
        timeFormat,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  /**
   * Get user regional preferences
   */
  async getUserPreferences(userId: string): Promise<UserRegionalPreferences | null> {
    // For development, get from localStorage
    if (isDevelopment) {
      console.log('Development mode: Getting user preferences from localStorage');
      try {
        const storedPrefs = localStorage.getItem(`userPrefs_${userId}`);
        if (storedPrefs) {
          return JSON.parse(storedPrefs) as UserRegionalPreferences;
}
        return null;
      } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
      }
    }

    try {
      const userPrefRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
      const userPrefDoc = await getDoc(userPrefRef);
      
      if (userPrefDoc.exists()) {
        return userPrefDoc.data() as UserRegionalPreferences;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
}

export const userPreferencesService = new UserPreferencesService();