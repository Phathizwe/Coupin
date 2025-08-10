import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PricingPlan } from '@/types/billing.types';
import { Currency } from '@/types/currency.types'; // Updated import path

// Currency formatter utility
export const formatCurrency = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback if the currency code is invalid
    console.error(`Error formatting currency ${currencyCode}:`, error);
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

interface PlanEditorProps {
  plan: PricingPlan;
  currencies: Currency[];
  onSave: (updatedPlan: PricingPlan) => void;
  onCancel: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const PlanEditor: React.FC<PlanEditorProps> = ({
  plan,
  currencies,
  onSave,
  onCancel,
  onError,
  onSuccess
}) => {
  const [editingPlan, setEditingPlan] = useState<PricingPlan>(plan);
  const [isSaving, setIsSaving] = useState(false);
  const [currencyPrices, setCurrencyPrices] = useState<{ [key: string]: string }>({});
  const [basePrice, setBasePrice] = useState<string>(plan.price.toString());
  const [baseCurrency, setBaseCurrency] = useState<string>(plan.currency);

  // Initialize currency prices from plan data
  useEffect(() => {
    const prices: { [key: string]: string } = {};

    // Initialize with empty strings for all currencies
    currencies.forEach(currency => {
      if (currency.code !== baseCurrency) {
        prices[currency.code] = '';
      }
    });

    // Fill in existing prices
    editingPlan.currencyPrices?.forEach(cp => {
      prices[cp.currencyCode] = cp.price.toString();
    });

    setCurrencyPrices(prices);
  }, [editingPlan.id, currencies, baseCurrency]);

  const handleCurrencyPriceChange = (currencyCode: string, priceStr: string) => {
    setCurrencyPrices(prev => ({
      ...prev,
      [currencyCode]: priceStr
    }));
  };

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasePrice(e.target.value);
  };

  const handleBaseCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBaseCurrency = e.target.value;
    setBaseCurrency(newBaseCurrency);

    // Update currency prices when base currency changes
    setCurrencyPrices(prev => {
      const updated = { ...prev };

      // If the new base currency was previously in currencyPrices, remove it
      if (updated[newBaseCurrency] !== undefined) {
        delete updated[newBaseCurrency];
      }

      // Add the old base currency to currencyPrices if it's not the new base currency
      if (baseCurrency !== newBaseCurrency) {
        updated[baseCurrency] = basePrice;
      }

      return updated;
    });
  };

  const savePlanPrices = async () => {
    try {
      setIsSaving(true);

      // Validate base price
      const parsedBasePrice = parseFloat(basePrice);
      if (isNaN(parsedBasePrice) || parsedBasePrice < 0) {
        onError('Base price must be a valid number');
        setIsSaving(false);
        return;
      }

      // Convert string prices to number and filter out empty values
      const updatedCurrencyPrices = Object.entries(currencyPrices)
        .filter(([code, price]) => price !== '' && code !== baseCurrency)
        .map(([code, price]) => ({
          currencyCode: code,
          price: parseFloat(price)
        }));

      const updatedPlan = {
        ...editingPlan,
        price: parsedBasePrice,
        currency: baseCurrency,
        currencyPrices: updatedCurrencyPrices
      };

      const planRef = doc(db, 'pricing_plans', editingPlan.id);
      await updateDoc(planRef, {
        price: parsedBasePrice,
        currency: baseCurrency,
        currencyPrices: updatedCurrencyPrices,
        updatedAt: new Date()
      });

      onSuccess(`Pricing for "${editingPlan.name}" has been updated successfully`);
      onSave(updatedPlan);
    } catch (err) {
      console.error('Error saving plan prices:', err);
      onError('Failed to save pricing information');
    } finally {
      setIsSaving(false);
    }
  };

  // Group currencies by region for better organization
  const currenciesByRegion: { [region: string]: Currency[] } = {};
  currencies.forEach(currency => {
    if (currency.code === baseCurrency) return; // Skip base currency

    const region = currency.region || 'Other';
    if (!currenciesByRegion[region]) {
      currenciesByRegion[region] = [];
    }
    currenciesByRegion[region].push(currency);
  });

  // Get currencies for the dropdown, sorted alphabetically
  const sortedCurrencies = [...currencies].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="border-t border-gray-200 px-4 py-5">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Edit Pricing for {editingPlan.name}
      </h3>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700 mb-1">
              Base Currency
            </label>
            <select
              id="baseCurrency"
              value={baseCurrency}
              onChange={handleBaseCurrencyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isSaving}
            >
              {sortedCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/2">
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Base Price ({baseCurrency})
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="basePrice"
                value={basePrice}
                onChange={handleBasePriceChange}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isSaving}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <span className="text-gray-500 sm:text-sm pr-4">
                  {currencies.find(c => c.code === baseCurrency)?.symbol || baseCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-2">Additional Currency Prices</h4>
        <p className="text-sm text-gray-500 mb-4">
          Set prices for additional currencies. Leave blank to exclude a currency.
        </p>

        {Object.entries(currenciesByRegion).length > 0 ? (
          Object.entries(currenciesByRegion).map(([region, regionCurrencies]) => (
            <div key={region} className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">{region}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionCurrencies.map(currency => (
                  <div key={currency.code} className="flex items-center space-x-2">
                    <div className="w-16 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">{currency.code}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          value={currencyPrices[currency.code] || ''}
                          onChange={(e) => handleCurrencyPriceChange(currency.code, e.target.value)}
                          className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          disabled={isSaving}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <span className="text-gray-500 sm:text-sm pr-4">
                            {currency.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No additional currencies available.</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={savePlanPrices}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
};

export default PlanEditor;