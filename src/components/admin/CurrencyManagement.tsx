import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

const CurrencyManagement: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const currenciesRef = collection(db, 'currencies');
      const snapshot = await getDocs(currenciesRef);

      const currencyData: Currency[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        currencyData.push({
          id: doc.id,
          code: doc.id,
          name: data.name || '',
          symbol: data.symbol || '',
          isActive: data.isActive !== false,
        });
      });

      setCurrencies(currencyData);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrency = async () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast.error('Please fill in all currency fields');
      return;
    }

    try {
      const currencyRef = doc(db, 'currencies', newCurrency.code.toUpperCase());

      await setDoc(currencyRef, {
        name: newCurrency.name,
        symbol: newCurrency.symbol,
        isActive: true,
        updatedAt: new Date()
      });

      toast.success(`Currency ${newCurrency.code} added successfully`);
      setNewCurrency({ code: '', name: '', symbol: '' });
      fetchCurrencies();
    } catch (error) {
      console.error('Error adding currency:', error);
      toast.error('Failed to add currency');
    }
  };

  const handleToggleActive = async (currencyCode: string) => {
    try {
      const currency = currencies.find(c => c.code === currencyCode);
      if (!currency) return;

      const currencyRef = doc(db, 'currencies', currencyCode);
      await setDoc(currencyRef, {
        isActive: !currency.isActive,
        updatedAt: new Date()
      }, { merge: true });

      // Update local state
      const updatedCurrencies = currencies.map(c => {
        if (c.code === currencyCode) {
          return { ...c, isActive: !c.isActive };
        }
        return c;
      });

      setCurrencies(updatedCurrencies);
      toast.success(`Currency ${currencyCode} ${currency.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      console.error('Error toggling currency active state:', error);
      toast.error('Failed to update currency');
    }
  };

  const handleDeleteCurrency = async (currencyCode: string) => {
    if (currencyCode === 'USD' || currencyCode === 'ZAR') {
      toast.error('Cannot delete base currencies');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${currencyCode}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'currencies', currencyCode));

      // Update local state
      setCurrencies(currencies.filter(c => c.code !== currencyCode));
      toast.success(`Currency ${currencyCode} deleted`);
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error('Failed to delete currency');
    }
  };

  if (loading) {
    return <div className="p-4">Loading currency data...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Currency Management</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Currency</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
            <input
              type="text"
              value={newCurrency.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
              placeholder="USD"
              maxLength={3}
              className="uppercase shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
            <input
              type="text"
              value={newCurrency.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCurrency({ ...newCurrency, name: e.target.value })}
              placeholder="US Dollar"
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={newCurrency.symbol}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
              placeholder="$"
              maxLength={5}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddCurrency}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Add Currency
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Manage Currencies</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage currency metadata including names, symbols, and active status.
          Pricing for each currency should be set directly in the pricing plans.
        </p>

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
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.map((currency) => (
                <tr key={currency.code}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {currency.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currency.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currency.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${currency.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleActive(currency.code)}
                      className={`${currency.isActive
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                        }`}
                    >
                      {currency.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {currency.code !== 'USD' && currency.code !== 'ZAR' && (
                      <button
                        onClick={() => handleDeleteCurrency(currency.code)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrencyManagement;