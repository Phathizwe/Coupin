import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Region, REGIONS_COLLECTION } from './types';
import { getDefaultRegions } from './default-data';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Service for managing regions
 */
class RegionService {
  /**
   * Get all available regions
   */
  async getRegions(): Promise<Region[]> {
    // For development, use default data to avoid Firestore permission errors
    if (isDevelopment) {
      console.log('Development mode: Using default regions');
        return getDefaultRegions();
      }
      
    try {
      console.log('Fetching regions from Firestore...');
      const regionsQuery = query(
        collection(db, REGIONS_COLLECTION),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(regionsQuery);
      
      if (snapshot.empty) {
        console.log('No regions found in Firestore, using default regions');
        return getDefaultRegions();
    }
      
      const regions = snapshot.docs
        .map(doc => ({ ...doc.data(), code: doc.id } as Region))
        .filter(region => region.isActive);
      
      console.log(`Successfully fetched ${regions.length} regions from Firestore`);
      return regions;
    } catch (error) {
      console.error('Error fetching regions from Firestore:', error);
      console.log('Using default regions as fallback');
      return getDefaultRegions();
  }
}
}

export const regionService = new RegionService();