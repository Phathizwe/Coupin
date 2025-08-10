import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, limit, orderBy, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  region?: string; // Added region property
  isActive: boolean;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface Region {
  code: string;
  name: string;
  flag: string;
  currencies: string[];
  isActive: boolean;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface UserRegionalPreferences {
  userId: string;
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  updatedAt: Timestamp;
}

class CurrencyService {
  private readonly CURRENCIES_COLLECTION = 'currencies';
  private readonly REGIONS_COLLECTION = 'regions';
  private readonly USER_PREFERENCES_COLLECTION = 'userRegionalPreferences';

  /**
   * Get the top active currencies (limited to 10 by default)
   */
  async getActiveCurrencies(limitCount: number = 10): Promise<Currency[]> {
    try {
      const currenciesQuery = query(
        collection(db, this.CURRENCIES_COLLECTION),
        orderBy('code', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(currenciesQuery);
      
      if (snapshot.empty) {
        console.log('No currencies found, initializing default currencies');
        await this.initializeDefaultCurrencies();
        return this.getDefaultCurrencies();
      }
      
      return snapshot.docs
        .map(doc => ({ ...doc.data(), code: doc.id } as Currency))
        .filter(currency => currency.isActive);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return this.getDefaultCurrencies();
    }
  }

  /**
   * Get all available regions
   */
  async getRegions(): Promise<Region[]> {
    try {
      const regionsQuery = query(
        collection(db, this.REGIONS_COLLECTION),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(regionsQuery);
      
      if (snapshot.empty) {
        console.log('No regions found, initializing default regions');
        await this.initializeDefaultRegions();
        return this.getDefaultRegions();
      }
      
      return snapshot.docs
        .map(doc => ({ ...doc.data(), code: doc.id } as Region))
        .filter(region => region.isActive);
    } catch (error) {
      console.error('Error fetching regions:', error);
      return this.getDefaultRegions();
    }
  }

  /**
   * Add or update a currency (admin only)
   */
  async updateCurrency(currency: Currency, adminUserId: string): Promise<boolean> {
    try {
      const currencyRef = doc(db, this.CURRENCIES_COLLECTION, currency.code);
      
      // Check if the currency exists
      const currencyDoc = await getDoc(currencyRef);
      
      if (currencyDoc.exists()) {
        // Update existing currency
        await updateDoc(currencyRef, {
          ...currency,
          updatedAt: Timestamp.now(),
          updatedBy: adminUserId
        });
      } else {
        // Create new currency
        await setDoc(currencyRef, {
          ...currency,
          updatedAt: Timestamp.now(),
          updatedBy: adminUserId
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating currency:', error);
      return false;
    }
  }

  /**
   * Delete a currency (admin only)
   */
  async deleteCurrency(currencyCode: string, adminUserId: string): Promise<boolean> {
    try {
      // Instead of deleting, mark as inactive
      const currencyRef = doc(db, this.CURRENCIES_COLLECTION, currencyCode);
      await updateDoc(currencyRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
        updatedBy: adminUserId
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting currency:', error);
      return false;
    }
  }

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
    try {
      const userPrefRef = doc(db, this.USER_PREFERENCES_COLLECTION, userId);
      
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
    try {
      const userPrefRef = doc(db, this.USER_PREFERENCES_COLLECTION, userId);
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

  /**
   * Initialize default currencies if none exist
   */
  private async initializeDefaultCurrencies(): Promise<void> {
    try {
      const defaultCurrencies = this.getDefaultCurrencies();
      
      // Create batch operations to add all currencies
      const batch = Promise.all(
        defaultCurrencies.map(currency => 
          setDoc(doc(db, this.CURRENCIES_COLLECTION, currency.code), {
            name: currency.name,
            symbol: currency.symbol,
            region: currency.region || 'Other', // Include region
            isActive: true,
            updatedAt: Timestamp.now(),
            updatedBy: 'system'
          })
        )
      );
      
      await batch;
      console.log('Default currencies initialized successfully');
    } catch (error) {
      console.error('Error initializing default currencies:', error);
    }
  }

  /**
   * Initialize default regions if none exist
   */
  private async initializeDefaultRegions(): Promise<void> {
    try {
      const defaultRegions = this.getDefaultRegions();
      
      // Create batch operations to add all regions
      const batch = Promise.all(
        defaultRegions.map(region => 
          setDoc(doc(db, this.REGIONS_COLLECTION, region.code), {
            name: region.name,
            flag: region.flag,
            currencies: region.currencies,
            isActive: true,
            updatedAt: Timestamp.now(),
            updatedBy: 'system'
          })
        )
      );
      
      await batch;
      console.log('Default regions initialized successfully');
    } catch (error) {
      console.error('Error initializing default regions:', error);
    }
  }

  /**
   * Get default currencies as fallback
   */
  private getDefaultCurrencies(): Currency[] {
    return [
      { code: "USD", name: "US Dollar", symbol: "$", region: "North America", isActive: true },
      { code: "EUR", name: "Euro", symbol: "€", region: "Europe", isActive: true },
      { code: "GBP", name: "British Pound", symbol: "£", region: "Europe", isActive: true },
      { code: "JPY", name: "Japanese Yen", symbol: "¥", region: "Asia-Pacific", isActive: true },
      { code: "CAD", name: "Canadian Dollar", symbol: "C$", region: "North America", isActive: true },
      { code: "AUD", name: "Australian Dollar", symbol: "A$", region: "Asia-Pacific", isActive: true },
      { code: "CHF", name: "Swiss Franc", symbol: "CHF", region: "Europe", isActive: true },
      { code: "CNY", name: "Chinese Yuan", symbol: "¥", region: "Asia-Pacific", isActive: true },
      { code: "INR", name: "Indian Rupee", symbol: "₹", region: "Asia-Pacific", isActive: true },
      { code: "BRL", name: "Brazilian Real", symbol: "R$", region: "Latin America", isActive: true },
    ];
  }

  /**
   * Get default regions as fallback
   */
  private getDefaultRegions(): Region[] {
    return [
      { code: "US", name: "United States", flag: "🇺🇸", currencies: ["USD"], isActive: true },
      { code: "GB", name: "United Kingdom", flag: "🇬🇧", currencies: ["GBP"], isActive: true },
      { code: "DE", name: "Germany", flag: "🇩🇪", currencies: ["EUR"], isActive: true },
      { code: "FR", name: "France", flag: "🇫🇷", currencies: ["EUR"], isActive: true },
      { code: "JP", name: "Japan", flag: "🇯🇵", currencies: ["JPY"], isActive: true },
      { code: "CA", name: "Canada", flag: "🇨🇦", currencies: ["CAD"], isActive: true },
      { code: "AU", name: "Australia", flag: "🇦🇺", currencies: ["AUD"], isActive: true },
      { code: "CH", name: "Switzerland", flag: "🇨🇭", currencies: ["CHF"], isActive: true },
      { code: "CN", name: "China", flag: "🇨🇳", currencies: ["CNY"], isActive: true },
      { code: "IN", name: "India", flag: "🇮🇳", currencies: ["INR"], isActive: true },
      { code: "BR", name: "Brazil", flag: "🇧🇷", currencies: ["BRL"], isActive: true },
    ];
  }
}

export const currencyService = new CurrencyService();