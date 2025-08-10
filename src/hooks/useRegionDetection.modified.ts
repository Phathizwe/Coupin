import { useState, useEffect } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Region {
  code: string;
  name: string;
  flag: string;
}

export interface RegionDetectionResult {
  currencies: Currency[];
  regions: Region[];
  selectedCurrency: string;
  selectedRegion: string;
  isLoading: boolean;
  setSelectedCurrency: (code: string) => void;
  setSelectedRegion: (code: string) => void;
  resetToDetected: () => Promise<void>;
  detectedRegion: string | null;
}

export function useRegionDetection(
  defaultCurrency: string = 'USD',
  defaultRegion: string = 'US',
  onCurrencyChange?: (currency: string) => void,
  onRegionChange?: (region: string) => void
): RegionDetectionResult {
  const [selectedCurrency, setSelectedCurrencyState] = useState(defaultCurrency);
  const [selectedRegion, setSelectedRegionState] = useState(defaultRegion);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    localStorage.setItem('userCurrency', code);
    // Mark that this was explicitly set by the user
    localStorage.setItem('userExplicitCurrencyChoice', 'true');
    console.log('Currency set to:', code);
    
    // Call the callback if provided
    if (onCurrencyChange) {
      onCurrencyChange(code);
      
      // Dispatch a custom event to ensure all components are updated
      document.dispatchEvent(new CustomEvent('currency-changed', { 
        detail: { 
          currency: code,
          isExplicit: true 
        } 
      }));
    }
  };

  const setSelectedRegion = (code: string) => {
    setSelectedRegionState(code);
    localStorage.setItem('userRegion', code);
    console.log('Region set to:', code);
    
    // Dispatch a region-changed event
    document.dispatchEvent(new CustomEvent('region-changed', { 
      detail: { region: code } 
    }));
    
    // Call the callback if provided
    if (onRegionChange) {
      onRegionChange(code);
    }
    
    // Only update currency if user hasn't made an explicit choice
    const userExplicitlySelectedCurrency = localStorage.getItem('userExplicitCurrencyChoice') === 'true';
    if (!userExplicitlySelectedCurrency) {
      const defaultCurrencyForRegion = getDefaultCurrencyForRegion(code);
      if (defaultCurrencyForRegion) {
        setSelectedCurrencyState(defaultCurrencyForRegion);
        localStorage.setItem('userCurrency', defaultCurrencyForRegion);
        
        // Call the callback if provided
        if (onCurrencyChange) {
          onCurrencyChange(defaultCurrencyForRegion);
        }
      }
    } else {
      console.log('Preserving user currency choice despite region change');
    }
  };

  // Get default currency for a region
  const getDefaultCurrencyForRegion = (regionCode: string): string => {
    const regionCurrencyMap: Record<string, string> = {
      'US': 'USD',
      'GB': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'JP': 'JPY',
      'CA': 'CAD',
      'AU': 'AUD',
      'CH': 'CHF',
      'CN': 'CNY',
      'IN': 'INR',
      'BR': 'BRL',
      'ZA': 'ZAR', // Added South Africa
    };
    
    return regionCurrencyMap[regionCode] || 'USD';
  };

  // Detect user's region using multiple geolocation APIs for redundancy
  const detectUserRegion = async (): Promise<string> => {
    try {
      // First try ipapi.co
      try {
        console.log('Attempting to detect region with ipapi.co...');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.country) {
          console.log('ipapi.co detected region:', data.country);
          setDetectedRegion(data.country);
          return data.country;
        }
      } catch (error) {
        console.error('Error with ipapi.co:', error);
      }
      
      // Fallback to ipinfo.io
      try {
        console.log('Attempting to detect region with ipinfo.io...');
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        
        if (data && data.country) {
          console.log('ipinfo.io detected region:', data.country);
          setDetectedRegion(data.country);
          return data.country;
        }
      } catch (error) {
        console.error('Error with ipinfo.io:', error);
      }
      
      // Fallback to geolocation-db.com
      try {
        console.log('Attempting to detect region with geolocation-db.com...');
        const response = await fetch('https://geolocation-db.com/json/');
        const data = await response.json();
        
        if (data && data.country_code) {
          console.log('geolocation-db.com detected region:', data.country_code);
          setDetectedRegion(data.country_code);
          return data.country_code;
        }
      } catch (error) {
        console.error('Error with geolocation-db.com:', error);
      }
      
      // If all APIs fail, use browser language as a hint
      const browserLang = navigator.language || 'en-US';
      const countryFromLang = browserLang.split('-')[1] || 'US';
      console.log('Using browser language as fallback:', countryFromLang);
      setDetectedRegion(countryFromLang);
      return countryFromLang;
      
    } catch (error) {
      console.error('Error detecting user region:', error);
      console.log('Defaulting to US');
      setDetectedRegion('US');
      return 'US';
    }
  };

  // Function to reset to detected region and clear localStorage
  const resetToDetected = async () => {
    console.log('Resetting to detected region...');
    localStorage.removeItem('userRegion');
    localStorage.removeItem('userCurrency');
    localStorage.removeItem('userExplicitCurrencyChoice'); // Clear explicit choice flag
    
    const detectedRegionCode = await detectUserRegion();
    const regionCurrency = getDefaultCurrencyForRegion(detectedRegionCode);
    
    setSelectedRegion(detectedRegionCode);
    setSelectedCurrency(regionCurrency);
    
    console.log('Reset complete. Region:', detectedRegionCode, 'Currency:', regionCurrency);
  };

  useEffect(() => {
    // Load currencies and regions
    const loadCurrenciesAndRegions = async () => {
      try {
        setIsLoading(true);
        
        // Regions will be loaded from a static list for now
        const regionsList = [
          { code: "US", name: "United States", flag: "🇺🇸" },
          { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
          { code: "DE", name: "Germany", flag: "🇩🇪" },
          { code: "FR", name: "France", flag: "🇫🇷" },
          { code: "JP", name: "Japan", flag: "🇯🇵" },
          { code: "CA", name: "Canada", flag: "🇨🇦" },
          { code: "AU", name: "Australia", flag: "🇦🇺" },
          { code: "CH", name: "Switzerland", flag: "🇨🇭" },
          { code: "CN", name: "China", flag: "🇨🇳" },
          { code: "IN", name: "India", flag: "🇮🇳" },
          { code: "BR", name: "Brazil", flag: "🇧🇷" },
          { code: "ZA", name: "South Africa", flag: "🇿🇦" }, // Added South Africa
        ];
        setRegions(regionsList);
        
        // Currencies will be loaded from Firestore in the CurrencyService
        // For now, use a fallback list
        const fallbackCurrencies = [
          { code: "USD", name: "US Dollar", symbol: "$" },
          { code: "EUR", name: "Euro", symbol: "€" },
          { code: "GBP", name: "British Pound", symbol: "£" },
          { code: "JPY", name: "Japanese Yen", symbol: "¥" },
          { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
          { code: "AUD", name: "Australian Dollar", symbol: "A$" },
          { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
          { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
          { code: "INR", name: "Indian Rupee", symbol: "₹" },
          { code: "BRL", name: "Brazilian Real", symbol: "R$" },
          { code: "ZAR", name: "South African Rand", symbol: "R" }, // Added South African Rand
        ];
        
        // This will be replaced with Firestore fetch
        setCurrencies(fallbackCurrencies);
        
        // Check localStorage for saved preferences
        const savedRegion = localStorage.getItem('userRegion');
        const savedCurrency = localStorage.getItem('userCurrency');
        
        console.log('Saved region in localStorage:', savedRegion);
        console.log('Saved currency in localStorage:', savedCurrency);
        
        if (savedRegion && savedCurrency) {
          // Use saved preferences
          console.log('Using saved preferences from localStorage');
          setSelectedRegionState(savedRegion);
          setSelectedCurrencyState(savedCurrency);
          
          // Make sure to call the callbacks with the saved values
          if (onRegionChange) onRegionChange(savedRegion);
          if (onCurrencyChange) onCurrencyChange(savedCurrency);
          
          // Still detect region in the background for information
          detectUserRegion().then(() => {
            console.log('Background detection complete');
          });
        } else {
          // If no saved preferences, detect user region
          console.log('No saved preferences, detecting region...');
          const detectedRegionCode = await detectUserRegion();
          const regionCurrency = getDefaultCurrencyForRegion(detectedRegionCode);
          
          setSelectedRegion(detectedRegionCode);
          setSelectedCurrency(regionCurrency);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading currencies and regions:', error);
        setIsLoading(false);
      }
    };

    loadCurrenciesAndRegions();
  }, [onCurrencyChange, onRegionChange]);

  return {
    currencies,
    regions,
    selectedCurrency,
    selectedRegion,
    isLoading,
    setSelectedCurrency,
    setSelectedRegion,
    resetToDetected,
    detectedRegion
  };
}