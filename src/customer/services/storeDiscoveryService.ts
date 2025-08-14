import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface BusinessSearchResult {
  id: string;
  businessName: string;
  email: string;
  description?: string;
  category?: string;
  location?: string;
  loyaltyPrograms: LoyaltyProgramSummary[];
  hasActivePrograms: boolean;
}

export interface LoyaltyProgramSummary {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'visits' | 'cashback';
  isActive: boolean;
}

export class StoreDiscoveryService {
  /**
   * Search for businesses by name, category, or location
   * Must find "Mike's Coffee Shop" and other registered businesses
   */
  async searchBusinesses(searchTerm: string): Promise<BusinessSearchResult[]> {
    try {
      const searchTermLower = searchTerm.toLowerCase().trim();
      // Search in businesses collection
      const businessesRef = collection(db, 'businesses');
      // Create multiple queries for comprehensive search
      const nameQuery = query(
        businessesRef,
        where('businessName_lower', '>=', searchTermLower),
        where('businessName_lower', '<=', searchTermLower + '\uf8ff'),
        orderBy('businessName_lower'),
        limit(20)
      );
      const results = await getDocs(nameQuery);
      const businesses: BusinessSearchResult[] = [];
      for (const doc of results.docs) {
        const businessData = doc.data();
        // Get loyalty programs for this business
        const loyaltyPrograms = await this.getBusinessLoyaltyPrograms(doc.id);
        businesses.push({
          id: doc.id,
          businessName: businessData.businessName || businessData.fullName,
          email: businessData.email,
          description: businessData.description,
          category: businessData.category,
          location: businessData.location,
          loyaltyPrograms,
          hasActivePrograms: loyaltyPrograms.length > 0
        });
      }
      return businesses;
    } catch (error) {
      console.error('Store discovery error:', error);
      throw new Error('Failed to search businesses');
    }
  }

  private async getBusinessLoyaltyPrograms(businessId: string): Promise<LoyaltyProgramSummary[]> {
    try {
      const programsRef = collection(db, 'loyaltyPrograms');
      const programsQuery = query(
        programsRef,
        where('businessId', '==', businessId),
        where('isActive', '==', true)
      );
      const programsSnapshot = await getDocs(programsQuery);
      return programsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        type: doc.data().type,
        isActive: doc.data().isActive
      }));
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      return [];
    }
  }
}

export const storeDiscoveryService = new StoreDiscoveryService();