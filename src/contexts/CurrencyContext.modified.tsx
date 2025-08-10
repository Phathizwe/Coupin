import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  region: string;
  setRegion: (region: string) => void;
  getCurrencySymbol: (currencyCode?: string) => string;
  isLoading: boolean;
}

// Default currency symbols map as fallback
const defaultCurrencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  ZAR: 'R',
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  region: 'US',
  setRegion: () => {},
  getCurrencySymbol: () => '$',
  isLoading: false,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    console.log('[CurrencyContext] Initial currency from localStorage:', savedCurrency);
    return savedCurrency || 'USD';
  });
  
  const [region, setRegionState] = useState<string>(() => {
    const savedRegion = localStorage.getItem('userRegion');
    console.log('[CurrencyContext] Initial region from localStorage:', savedRegion);
    return savedRegion || 'US';
  });

  const [symbolsMap, setSymbolsMap] = useState<Record<string, string>>(defaultCurrencySymbols);
  const [isLoading, setIsLoading] = useState(false);

  // Load currency symbols from Firestore
  useEffect(() => {
    const loadCurrencySymbols = async () => {
      try {
        const currenciesRef = collection(db, 'currencies');
        const currenciesSnapshot = await getDocs(currenciesRef);
        
        if (!currenciesSnapshot.empty) {
          const symbols: Record<string, string> = {};
          
          currenciesSnapshot.forEach(doc => {
            const data = doc.data();
            symbols[doc.id] = data.symbol || doc.id;
          });
          
          setSymbolsMap({...defaultCurrencySymbols, ...symbols});
        }
      } catch (error) {
        console.error('[CurrencyContext] Error loading currency symbols:', error);
        // Keep using default symbols on error
      }
    };
    
    loadCurrencySymbols();
  }, []);

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode?: string): string => {
    const code = currencyCode || currency;
    return symbolsMap[code] || code;
  };

  // Enhanced setCurrency function that handles side effects
  const setCurrency = (newCurrency: string) => {
    console.log('[CurrencyContext] Setting currency to:', newCurrency);
    setIsLoading(true);
    localStorage.setItem('userCurrency', newCurrency);
    // Mark that the user explicitly chose this currency
    localStorage.setItem('userExplicitCurrencyChoice', 'true');
    setCurrencyState(newCurrency);
    
    // Add a small delay to simulate loading and ensure UI updates
    setTimeout(() => {
      setIsLoading(false);
      console.log('[CurrencyContext] Dispatching currency-changed event for:', newCurrency);
      // Force a re-render of components that depend on currency
      document.dispatchEvent(new CustomEvent('currency-changed', { 
        detail: { 
          currency: newCurrency,
          isExplicit: true 
        } 
      }));
    }, 300);
  };

  // Enhanced setRegion function that handles side effects
  const setRegion = (newRegion: string) => {
    console.log('[CurrencyContext] Setting region to:', newRegion);
    setIsLoading(true);
    localStorage.setItem('userRegion', newRegion);
    setRegionState(newRegion);
    
    // Dispatch a region-changed event
    document.dispatchEvent(new CustomEvent('region-changed', { 
      detail: { region: newRegion } 
    }));
    
    // Only update currency based on region if user hasn't explicitly chosen a currency
    const userExplicitlySelectedCurrency = localStorage.getItem('userExplicitCurrencyChoice') === 'true';
    
    if (!userExplicitlySelectedCurrency) {
      // Automatically update currency based on region
      const regionToCurrency: Record<string, string> = {
        'US': 'USD',
        'GB': 'GBP',
        'EU': 'EUR',
        'ZA': 'ZAR',
        'JP': 'JPY',
        'CA': 'CAD',
        'AU': 'AUD',
        'CH': 'CHF',
        'CN': 'CNY',
        'IN': 'INR',
        'BR': 'BRL',
        'DE': 'EUR', // Germany uses Euro
      };
      
      // When region changes, update currency if there's a mapping
      const defaultCurrencyForRegion = regionToCurrency[newRegion];
      if (defaultCurrencyForRegion) {
        console.log('[CurrencyContext] Updating currency based on region to:', defaultCurrencyForRegion);
        setCurrencyState(defaultCurrencyForRegion);
        localStorage.setItem('userCurrency', defaultCurrencyForRegion);
        
        // Dispatch event but don't mark as explicit choice
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('currency-changed', { 
            detail: { currency: defaultCurrencyForRegion } 
          }));
        }, 100);
      }
    } else {
      console.log('[CurrencyContext] Preserving user currency choice despite region change');
    }
    
    // Add a small delay to simulate loading and ensure UI updates
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    // Listen for currency changes from other components
    const handleCurrencyChange = (event: any) => {
      console.log('[CurrencyContext] Received currency-changed event:', event.detail);
      // This will trigger a re-render of components using the currency context
      
      // If this is a preserved choice event, update the state without side effects
      if (event.detail.preserveChoice && event.detail.isExplicit) {
        setCurrencyState(event.detail.currency);
      }
    };

    document.addEventListener('currency-changed', handleCurrencyChange);
    
    // Debug: Log when currency changes
    console.log('[CurrencyContext] Currency in context updated to:', currency);
    
    return () => {
      document.removeEventListener('currency-changed', handleCurrencyChange);
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        region,
        setRegion,
        getCurrencySymbol,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};