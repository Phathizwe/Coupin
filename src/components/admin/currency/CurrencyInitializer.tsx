import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-toastify';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  region: string;
  isActive: boolean;
}

interface CurrencyInitializerProps {
  onComplete?: () => void;
}

const CurrencyInitializer: React.FC<CurrencyInitializerProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [existingCurrencies, setExistingCurrencies] = useState<string[]>([]);
  const [result, setResult] = useState<{ added: string[], skipped: string[] }>({ added: [], skipped: [] });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    checkExistingCurrencies();
  }, []);

  const checkExistingCurrencies = async () => {
    try {
      const currenciesRef = collection(db, 'currencies');
      const snapshot = await getDocs(currenciesRef);
      const existing = snapshot.docs.map(doc => doc.id);
      setExistingCurrencies(existing);
    } catch (error) {
      console.error('Error checking existing currencies:', error);
      toast.error('Failed to check existing currencies');
    }
  };

  const currenciesToAdd: Currency[] = [
    // North America
    { code: 'USD', name: 'US Dollar', symbol: '$', region: 'North America', isActive: true },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', region: 'North America', isActive: true },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'North America', isActive: true },
    
    // Europe
    { code: 'EUR', name: 'Euro', symbol: '€', region: 'Europe', isActive: true },
    { code: 'GBP', name: 'British Pound', symbol: '£', region: 'Europe', isActive: true },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'Europe', isActive: true },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'Europe', isActive: true },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'Europe', isActive: true },
    
    // Asia-Pacific
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Asia-Pacific', isActive: true },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'Asia-Pacific', isActive: true },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', region: 'Asia-Pacific', isActive: true },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', region: 'Asia-Pacific', isActive: true },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', region: 'Asia-Pacific', isActive: true },
    
    // Middle East & Africa
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', region: 'Middle East & Africa', isActive: true },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', region: 'Middle East & Africa', isActive: true },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'Middle East & Africa', isActive: true },
    
    // Latin America
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'Latin America', isActive: true },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'Latin America', isActive: true },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$', region: 'Latin America', isActive: true },
  ];

  const initializeCurrencies = async () => {
    if (!user?.uid) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsInitializing(true);
    const added: string[] = [];
    const skipped: string[] = [];

    try {
      for (const currency of currenciesToAdd) {
        // Skip if currency already exists
        if (existingCurrencies.includes(currency.code)) {
          skipped.push(currency.code);
          continue;
        }

        // Add new currency to Firestore
        const currencyRef = doc(db, 'currencies', currency.code);
        await setDoc(currencyRef, {
          name: currency.name,
          symbol: currency.symbol,
          region: currency.region,
          isActive: currency.isActive,
          updatedAt: new Date(),
          updatedBy: user.uid
        });
        
        added.push(currency.code);
      }

      setResult({ added, skipped });
      setShowResults(true);
      
      if (added.length > 0) {
        toast.success(`Successfully added ${added.length} currencies`);
      } else {
        toast.info('All currencies already exist in the database');
      }
      
      // Refresh the list of existing currencies
      checkExistingCurrencies();
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error initializing currencies:', error);
      toast.error('Failed to initialize currencies');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Currency Initializer</h2>
      <p className="text-sm text-gray-500 mb-4">
        This tool will add all required currencies to your Firestore database. 
        Existing currencies will be skipped.
      </p>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Currencies to be added:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {currenciesToAdd.map(currency => (
            <div 
              key={currency.code} 
              className={`p-2 rounded ${existingCurrencies.includes(currency.code) ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}
            >
              <span className="font-medium">{currency.code}</span> - {currency.name} 
              {existingCurrencies.includes(currency.code) && ' (already exists)'}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={initializeCurrencies}
        disabled={isInitializing}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isInitializing ? 'Initializing...' : 'Initialize Currencies'}
      </button>
      
      {showResults && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-md font-medium mb-2">Results:</h3>
          
          {result.added.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-green-600 mb-1">Added ({result.added.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {result.added.map(code => (
                  <span key={code} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {result.skipped.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Skipped ({result.skipped.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {result.skipped.map(code => (
                  <span key={code} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyInitializer;