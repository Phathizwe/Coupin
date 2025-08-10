import { db } from '@/config/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

interface CurrencySymbol {
  code: string;
  symbol: string;
}

class CurrencySymbolService {
  private symbols: Map<string, string> = new Map();
  private initialized = false;

  async getCurrencySymbol(currencyCode: string): Promise<string> {
    if (!this.initialized) {
      await this.loadCurrencySymbols();
    }
    
    return this.symbols.get(currencyCode) || currencyCode;
  }

  private async loadCurrencySymbols(): Promise<void> {
    try {
      const currenciesRef = collection(db, 'currencies');
      const snapshot = await getDocs(query(currenciesRef));
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        this.symbols.set(doc.id, data.symbol);
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Error loading currency symbols:', error);
      // Fallback with empty map, will return currency code as symbol
    }
  }
}

export const currencySymbolService = new CurrencySymbolService();