import React, { useState, useEffect } from 'react';
import { currencyService, Currency } from '@/services/currencyService';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';

interface CurrencyManagerProps {
  isAdmin: boolean;
}

export default function CurrencyManager({ isAdmin }: CurrencyManagerProps) {
  const { user } = useAuth() || { user: null };
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
    isActive: true
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setError('You do not have permission to access this page');
      return;
    }

    const loadCurrencies = async () => {
      setIsLoading(true);
      try {
        // Load all currencies, not just active ones
        const currenciesCollection = await currencyService.getActiveCurrencies(100);
        setCurrencies(currenciesCollection);
      } catch (err) {
        setError('Failed to load currencies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencies();
  }, [isAdmin]);

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency({ ...currency });
  };

  const handleCancelEdit = () => {
    setEditingCurrency(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCurrency || !user) return;

    setIsLoading(true);
    try {
      const success = await currencyService.updateCurrency(editingCurrency, user.uid);
      if (success) {
        setCurrencies(prevCurrencies => 
          prevCurrencies.map(c => 
            c.code === editingCurrency.code ? editingCurrency : c
          )
        );
        setEditingCurrency(null);
      } else {
        setError('Failed to update currency');
      }
    } catch (err) {
      setError('An error occurred while updating the currency');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurrency = async (currencyCode: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this currency?')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await currencyService.deleteCurrency(currencyCode, user.uid);
      if (success) {
        setCurrencies(prevCurrencies => 
          prevCurrencies.filter(c => c.code !== currencyCode)
        );
      } else {
        setError('Failed to delete currency');
      }
    } catch (err) {
      setError('An error occurred while deleting the currency');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewCurrency({
      code: '',
      name: '',
      symbol: '',
      isActive: true
    });
  };

  const handleSaveNew = async () => {
    if (!user || !newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      // Check if currency code already exists
      if (currencies.some(c => c.code === newCurrency.code)) {
        setError('Currency code already exists');
        setIsLoading(false);
        return;
      }

      const newCurrencyComplete = {
        code: newCurrency.code,
        name: newCurrency.name,
        symbol: newCurrency.symbol,
        isActive: true
      } as Currency;

      const success = await currencyService.updateCurrency(newCurrencyComplete, user.uid);
      if (success) {
        setCurrencies(prevCurrencies => [...prevCurrencies, newCurrencyComplete]);
        handleCancelAdd();
      } else {
        setError('Failed to add currency');
      }
    } catch (err) {
      setError('An error occurred while adding the currency');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  if (isLoading && currencies.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Currency Management</h1>
        <button
          onClick={handleAddNew}
          disabled={isAddingNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> Add New Currency
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isAddingNew && (
        <div className="bg-white p-4 rounded-md shadow-md mb-6 border">
          <h2 className="text-lg font-semibold mb-4">Add New Currency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="USD"
                value={newCurrency.code}
                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                maxLength={3}
              />
              <p className="text-xs text-gray-500 mt-1">3-letter ISO code (e.g., USD, EUR)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="US Dollar"
                value={newCurrency.name}
                onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="$"
                value={newCurrency.symbol}
                onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                maxLength={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNew}
              disabled={!newCurrency.code || !newCurrency.name || !newCurrency.symbol || isLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-md shadow overflow-hidden">
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currencies.map((currency) => (
              <tr key={currency.code}>
                {editingCurrency?.code === currency.code ? (
                  // Editing mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editingCurrency.code}
                        onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value.toUpperCase() })}
                        disabled // Don't allow changing the code (primary key)
                        maxLength={3}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editingCurrency.name}
                        onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md"
                        value={editingCurrency.symbol}
                        onChange={(e) => setEditingCurrency({ ...editingCurrency, symbol: e.target.value })}
                        maxLength={3}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="w-full px-2 py-1 border rounded-md"
                        value={editingCurrency.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditingCurrency({ 
                          ...editingCurrency, 
                          isActive: e.target.value === 'active' 
                        })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{currency.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{currency.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        currency.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCurrency(currency)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCurrency(currency.code)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}