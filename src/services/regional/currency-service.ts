import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Currency, CURRENCIES_COLLECTION } from './types';
import { getDefaultCurrencies } from './default-data';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Service for managing currencies
 */
class CurrencyService {
  /**
   * Get the top active currencies (limited to 10 by default)
   */
  async getActiveCurrencies(limitCount: number = 10): Promise<Currency[]> {
    // For development, use default data to avoid Firestore permission errors
    if (isDevelopment) {
      console.log('Development mode: Using default currencies');
        return getDefaultCurrencies();
      }
      
    try {
      console.log('Fetching currencies from Firestore...');
      const currenciesQuery = query(
        collection(db, CURRENCIES_COLLECTION),
        orderBy('code', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(currenciesQuery);
      
      if (snapshot.empty) {
        console.log('No currencies found in Firestore, using default currencies');
        return getDefaultCurrencies();
    }
      
      const currencies = snapshot.docs
        .map(doc => ({ ...doc.data(), code: doc.id } as Currency))
        .filter(currency => currency.isActive);
      
      console.log(`Successfully fetched ${currencies.length} currencies from Firestore`);
      return currencies;
    } catch (error) {
      console.error('Error fetching currencies from Firestore:', error);
      console.log('Using default currencies as fallback');
      return getDefaultCurrencies();
    }
  }

  /**
   * Add or update a currency (admin only)
   */
  async updateCurrency(currency: Currency, adminUserId: string): Promise<boolean> {
    if (isDevelopment) {
      console.log('Development mode: Currency update simulated');
      return true;
}

    try {
      const currencyRef = doc(db, CURRENCIES_COLLECTION, currency.code);
      
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
    if (isDevelopment) {
      console.log('Development mode: Currency deletion simulated');
      return true;
    }
    
    try {
      // Instead of deleting, mark as inactive
      const currencyRef = doc(db, CURRENCIES_COLLECTION, currencyCode);
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
}

export const currencyService = new CurrencyService();