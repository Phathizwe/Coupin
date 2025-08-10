import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  Region, 
  UserRegionalPreferences, 
  currencyService, 
  regionService, 
  userPreferencesService,
  getDefaultCurrencyForRegion
} from '@/services/regional';
import { useAuth } from '@/hooks/useAuth'; // Assuming you have an auth hook

interface RegionalSettings {
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
}

interface RegionalSettingsContextType {
  settings: RegionalSettings;
  currencies: Currency[];
  regions: Region[];
  isLoading: boolean;
  updateSettings: (newSettings: Partial<RegionalSettings>) => Promise<boolean>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string | number) => string;
  formatTime: (date: Date | string | number) => string;
  formatDateTime: (date: Date | string | number) => string;
}

const defaultSettings: RegionalSettings = {
  region: 'US',
  currency: 'USD',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm:ss',
};

const RegionalSettingsContext = createContext<RegionalSettingsContextType | undefined>(undefined);

export const RegionalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() || { user: null };
  const [settings, setSettings] = useState<RegionalSettings>(defaultSettings);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load currencies and regions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load currencies from Firestore
        const currenciesData = await currencyService.getActiveCurrencies();
        setCurrencies(currenciesData);
        
        // Load regions
        const regionsData = await regionService.getRegions();
        setRegions(regionsData);
        
        // Check for saved settings in localStorage first (for non-logged in users)
        const savedRegion = localStorage.getItem('userRegion');
        const savedCurrency = localStorage.getItem('userCurrency');
        
        if (user) {
          // If user is logged in, try to get their preferences from Firestore
          const userPrefs = await userPreferencesService.getUserPreferences(user.uid);
          
          if (userPrefs) {
            setSettings({
              region: userPrefs.region,
              currency: userPrefs.currency,
              dateFormat: userPrefs.dateFormat,
              timeFormat: userPrefs.timeFormat,
            });
            
            // Update localStorage for consistency
            localStorage.setItem('userRegion', userPrefs.region);
            localStorage.setItem('userCurrency', userPrefs.currency);
          } else if (savedRegion && savedCurrency) {
            // If no Firestore preferences but localStorage exists, use those
            const newSettings = {
              region: savedRegion,
              currency: savedCurrency,
              dateFormat: defaultSettings.dateFormat,
              timeFormat: defaultSettings.timeFormat,
            };
            setSettings(newSettings);
            
            // Save to Firestore for future use
            await userPreferencesService.saveUserPreferences(user.uid, newSettings);
          } else {
            // If no preferences found, detect region
            await detectUserRegion();
          }
        } else if (savedRegion && savedCurrency) {
          // For non-logged in users, use localStorage if available
          setSettings({
            ...defaultSettings,
            region: savedRegion,
            currency: savedCurrency,
          });
        } else {
          // If no preferences found, detect region
          await detectUserRegion();
        }
      } catch (error) {
        console.error('Error loading regional settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Detect user's region using IP geolocation
  const detectUserRegion = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data && data.country) {
        const regionCode = data.country;
        const currencyCode = getDefaultCurrencyForRegion(regionCode);
        
        const newSettings = {
          region: regionCode,
          currency: currencyCode,
          dateFormat: defaultSettings.dateFormat,
          timeFormat: defaultSettings.timeFormat,
        };
        
        setSettings(newSettings);
        
        // Save to localStorage
        localStorage.setItem('userRegion', regionCode);
        localStorage.setItem('userCurrency', currencyCode);
        
        // If user is logged in, save to Firestore
        if (user) {
          await userPreferencesService.saveUserPreferences(user.uid, newSettings);
        }
      }
    } catch (error) {
      console.error('Error detecting user region:', error);
    }
  };

  // Update user settings
  const updateSettings = async (newSettings: Partial<RegionalSettings>): Promise<boolean> => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Save to localStorage
      if (newSettings.region) localStorage.setItem('userRegion', newSettings.region);
      if (newSettings.currency) localStorage.setItem('userCurrency', newSettings.currency);
      
      // If user is logged in, save to Firestore
      if (user) {
        await userPreferencesService.saveUserPreferences(user.uid, updatedSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  // Format currency based on user's preferences
  const formatCurrency = (amount: number): string => {
    try {
      const currencyObj = currencies.find(c => c.code === settings.currency);
      
      return new Intl.NumberFormat(settings.region, {
        style: 'currency',
        currency: settings.currency,
        currencyDisplay: 'symbol',
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount}`;
    }
  };

  // Format date based on user's preferences
  const formatDate = (date: Date | string | number): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      return new Intl.DateTimeFormat(settings.region, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  };

  // Format time based on user's preferences
  const formatTime = (date: Date | string | number): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      return new Intl.DateTimeFormat(settings.region, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: settings.region === 'US', // Use 12-hour format for US
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting time:', error);
      return String(date);
    }
  };

  // Format date and time together
  const formatDateTime = (date: Date | string | number): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      return new Intl.DateTimeFormat(settings.region, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: settings.region === 'US', // Use 12-hour format for US
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date and time:', error);
      return String(date);
    }
  };

  const value = {
    settings,
    currencies,
    regions,
    isLoading,
    updateSettings,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
  };

  return (
    <RegionalSettingsContext.Provider value={value}>
      {children}
    </RegionalSettingsContext.Provider>
  );
};

export const useRegionalSettings = () => {
  const context = useContext(RegionalSettingsContext);
  if (context === undefined) {
    throw new Error('useRegionalSettings must be used within a RegionalSettingsProvider');
  }
  return context;
};