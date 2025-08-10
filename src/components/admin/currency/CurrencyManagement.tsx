import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Currency } from '@/services/currencyService';
import { collection, getDocs, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-toastify';
import CurrencyInitializer from './CurrencyInitializer';

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

const CurrencyManagement: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingCurrency, setIsAddingCurrency] = useState<boolean>(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
  const [showInitializer, setShowInitializer] = useState<boolean>(false);

  const { user } = useAuth();

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    setLoading(true);
    try {
      // Directly query Firestore to get ALL currencies without sorting by code
      const currenciesRef = collection(db, 'currencies');
      const snapshot = await getDocs(currenciesRef);
      
      if (snapshot.empty) {
        console.log('No currencies found, showing initializer');
        setCurrencies([]);
        setShowInitializer(true);
      } else {
        // Map the documents to Currency objects, ensuring code is set from document ID
        const fetchedCurrencies = snapshot.docs.map(doc => ({
          code: doc.id, // Always use document ID as the code
          name: doc.data().name,
          symbol: doc.data().symbol,
          region: doc.data().region || 'Other', // Add region support
          isActive: doc.data().isActive ?? true,
          updatedAt: doc.data().updatedAt,
          updatedBy: doc.data().updatedBy
        } as Currency));
        
        // Sort currencies by region and then by code
        fetchedCurrencies.sort((a, b) => {
          if (a.region !== b.region) {
            return a.region?.localeCompare(b.region || 'Other') || 0;
          }
          return a.code.localeCompare(b.code);
        });
        
        setCurrencies(fetchedCurrencies);
      }
    } catch (error) {
      toast.error('Failed to load currencies');
      console.error('Error loading currencies:', error);
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrency = () => {
    setIsAddingCurrency(true);
    setEditingCurrency(null);
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsAddingCurrency(false);
  };

  const handleCancelForm = () => {
    setIsAddingCurrency(false);
    setEditingCurrency(null);
  };

  const handleToggleActive = async (currency: Currency) => {
    if (!user?.uid) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedCurrency = {
        ...currency,
        isActive: !currency.isActive
      };

      // Get a reference to the currency document
      const currencyRef = doc(db, 'currencies', currency.code);
      
      // Extract the code field to avoid storing it in the document
      const { code, ...currencyData } = updatedCurrency;
      
      // Update the document
      await updateDoc(currencyRef, {
        ...currencyData,
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      toast.success(`Currency ${currency.code} ${updatedCurrency.isActive ? 'activated' : 'deactivated'} successfully`);
      
      // Update the currency in the local state
      setCurrencies(prev => 
        prev.map(c => c.code === currency.code ? updatedCurrency : c)
      );
    } catch (error) {
      toast.error(`Error updating currency status`);
      console.error('Error toggling currency status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCurrency = async (currencyData: Currency) => {
    if (!user?.uid) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    // Ensure isActive is set (default to true for new currencies)
    const dataToSubmit = {
      ...currencyData,
      isActive: currencyData.isActive ?? true
    };

    setIsSubmitting(true);
    try {
      // Important: When saving, we need to make sure we're not including the code field
      // in the document data, as the code is used as the document ID
      const { code, ...currencyWithoutCode } = dataToSubmit;
      
      // Get a reference to the currency document
      const currencyRef = doc(db, 'currencies', code);
      
      // Check if it exists
      const currencyDoc = await getDoc(currencyRef);
      
      if (currencyDoc.exists()) {
        // Update existing currency without including code in the data
        await updateDoc(currencyRef, {
          ...currencyWithoutCode,
          updatedAt: new Date(),
          updatedBy: user.uid
        });
      } else {
        // Create new currency without including code in the data
        await setDoc(currencyRef, {
          ...currencyWithoutCode,
          updatedAt: new Date(),
          updatedBy: user.uid
        });
      }

      toast.success(`Currency ${dataToSubmit.code} ${editingCurrency ? 'updated' : 'added'} successfully`);
      setIsAddingCurrency(false);
      setEditingCurrency(null);
      loadCurrencies();
    } catch (error) {
      toast.error(`Error ${editingCurrency ? 'updating' : 'adding'} currency`);
      console.error('Error submitting currency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurrency = async (currencyCode: string) => {
    if (!user?.uid) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the currency ${currencyCode}?`)) {
      return;
    }

    setIsDeleting(prev => ({ ...prev, [currencyCode]: true }));
    try {
      // Instead of deleting, mark as inactive
      const currencyRef = doc(db, 'currencies', currencyCode);
      await updateDoc(currencyRef, {
        isActive: false,
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      toast.success(`Currency ${currencyCode} deleted successfully`);
      loadCurrencies();
    } catch (error) {
      toast.error('Error deleting currency');
      console.error('Error deleting currency:', error);
    } finally {
      setIsDeleting(prev => ({ ...prev, [currencyCode]: false }));
    }
  };

  const handleInitializerComplete = () => {
    loadCurrencies();
    setShowInitializer(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group currencies by region
  const currenciesByRegion: { [region: string]: Currency[] } = {};
  currencies.forEach(currency => {
    const region = currency.region || 'Other';
    if (!currenciesByRegion[region]) {
      currenciesByRegion[region] = [];
    }
    currenciesByRegion[region].push(currency);
  });

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">System Currencies</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInitializer(!showInitializer)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {showInitializer ? 'Hide Initializer' : 'Initialize Currencies'}
            </button>
            <button
              onClick={handleAddCurrency}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/80"
              disabled={isAddingCurrency}
            >
              Add New Currency
            </button>
          </div>
        </div>
      </div>

      {showInitializer && (
        <div className="p-6 border-b border-gray-200">
          <CurrencyInitializer onComplete={handleInitializerComplete} />
        </div>
      )}

      <div className="p-6">
        {(isAddingCurrency || editingCurrency) && (
          <div className="mb-8">
            <CurrencyForm
              currency={editingCurrency || {}}
              onSubmit={handleSubmitCurrency}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
              onChange={(field, value) => {
                if (editingCurrency) {
                  setEditingCurrency({ ...editingCurrency, [field]: value });
                }
              }}
              isNew={!editingCurrency}
            />
          </div>
        )}

        {currencies.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">No currencies found in the database.</p>
            <p className="text-sm text-gray-500">
              Use the "Initialize Currencies" button to add all required currencies automatically.
            </p>
          </div>
        ) : (
          <div>
            {Object.keys(currenciesByRegion).sort().map(region => (
              <div key={region} className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">{region}</h3>
                <CurrencyList
                  currencies={currenciesByRegion[region]}
                  onEditCurrency={handleEditCurrency}
                  onDeleteCurrency={handleDeleteCurrency}
                  onToggleActive={handleToggleActive}
                  isDeleting={isDeleting}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface CurrencyFormProps {
  currency: Partial<Currency>;
  onSubmit: (currency: Currency) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onChange?: (field: string, value: any) => void;
  isNew: boolean;
}

export const CurrencyForm: React.FC<CurrencyFormProps> = ({
  currency,
  onSubmit,
  onCancel,
  isSubmitting,
  onChange,
  isNew
}) => {
  const [formData, setFormData] = useState<Partial<Currency>>(currency);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // List of regions for the dropdown
  const regions = [
    'North America',
    'Europe',
    'Asia-Pacific',
    'Middle East & Africa',
    'Latin America',
    'Other'
  ];

  useEffect(() => {
    setFormData(currency);
  }, [currency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (onChange) {
      onChange(name, value);
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    if (onChange) {
      onChange(name, checked);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.code?.trim()) {
      newErrors.code = 'Currency code is required';
    } else if (!/^[A-Z]{3}$/.test(formData.code)) {
      newErrors.code = 'Currency code must be 3 uppercase letters (e.g., USD)';
    }
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Currency name is required';
    }
    
    if (!formData.symbol?.trim()) {
      newErrors.symbol = 'Currency symbol is required';
    }

    if (!formData.region) {
      newErrors.region = 'Region is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData as Currency);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-lg font-medium mb-4">{isNew ? 'Add New Currency' : 'Edit Currency'}</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Currency Code
          </label>
          <input
            type="text"
            name="code"
            id="code"
            value={formData.code || ''}
            onChange={handleChange}
            disabled={!isNew}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-gray-100"
            placeholder="USD"
          />
          {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Currency Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="US Dollar"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
            Currency Symbol
          </label>
          <input
            type="text"
            name="symbol"
            id="symbol"
            value={formData.symbol || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="$"
          />
          {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            name="region"
            id="region"
            value={formData.region || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">Select a region</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
        </div>
        
        <div className="flex items-center h-full pt-6">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive ?? true}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

interface CurrencyListProps {
  currencies: Currency[];
  onEditCurrency: (currency: Currency) => void;
  onDeleteCurrency: (code: string) => void;
  onToggleActive: (currency: Currency) => void;
  isDeleting: { [key: string]: boolean };
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  onEditCurrency,
  onDeleteCurrency,
  onToggleActive,
  isDeleting
}) => {
  // Format a sample amount to show how the currency formatting works
  const sampleAmount = 1234.56;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Symbol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Example
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currencies.map((currency) => (
            <tr key={currency.code} className={!currency.isActive ? 'bg-gray-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {currency.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {currency.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {currency.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(sampleAmount, currency.code)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    currency.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currency.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onToggleActive(currency)}
                    className={`text-xs px-2 py-1 rounded ${
                      currency.isActive
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {currency.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onEditCurrency(currency)}
                    className="text-indigo-600 hover:text-indigo-900 text-xs px-2 py-1 bg-indigo-100 rounded hover:bg-indigo-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteCurrency(currency.code)}
                    disabled={isDeleting[currency.code]}
                    className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {isDeleting[currency.code] ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyManagement;