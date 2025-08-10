import { db } from '@/config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

class CurrencyService {
  private symbolCache: Map<string, string> = new Map();
  
  /**
   * Get currency symbol for a currency code
   */
  async getSymbol(currencyCode: string): Promise<string> {
    // Check cache first
    if (this.symbolCache.has(currencyCode)) {
      return this.symbolCache.get(currencyCode)!;
    }
    
    try {
      const currencyRef = doc(db, 'currencies', currencyCode);
      const currencyDoc = await getDoc(currencyRef);
      
      if (currencyDoc.exists()) {
        const data = currencyDoc.data() as Currency;
        this.symbolCache.set(currencyCode, data.symbol);
        return data.symbol;
      }
      
      // Fallback to currency code if not found
      return currencyCode;
    } catch (error) {
      console.error(`Error getting symbol for ${currencyCode}:`, error);
      return currencyCode;
    }
  }
  
  /**
   * Get all active currencies
   */
  async getActiveCurrencies(): Promise<Currency[]> {
    try {
      const currenciesRef = collection(db, 'currencies');
      const q = query(currenciesRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data() as Currency;
        // Update symbol cache
        this.symbolCache.set(doc.id, data.symbol);
        return { ...data, code: doc.id };
      });
    } catch (error) {
      console.error('Error getting active currencies:', error);
      return [];
    }
  }
  
  /**
   * Format price with currency symbol
   */
  async formatPrice(price: number, currencyCode: string): Promise<string> {
    const symbol = await this.getSymbol(currencyCode);
    
    // Format based on currency
    if (currencyCode === 'JPY') {
      return `${symbol}${Math.round(price)}`;
    }
    
    return `${symbol}${price.toFixed(2)}`;
  }
}

export const currencyService = new CurrencyService();