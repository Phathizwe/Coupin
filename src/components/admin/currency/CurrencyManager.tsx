import React, { useState, useEffect } from 'react';
import { currencyService, Currency } from '@/services/regional';
import { useAuth } from '@/hooks/useAuth';
import { Plus, X } from 'lucide-react';
import { CurrencyForm } from './CurrencyForm';
import { CurrencyTable } from './CurrencyTable';

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

  const handleEditChange = (field: string, value: any) => {
    if (editingCurrency) {
      setEditingCurrency({ ...editingCurrency, [field]: value });
    }
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

  const handleNewCurrencyChange = (field: string, value: any) => {
    setNewCurrency({ ...newCurrency, [field]: value });
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
          disabled={isAddingNew || editingCurrency !== null}
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
        <CurrencyForm
          currency={newCurrency}
          onSave={handleSaveNew}
          onCancel={handleCancelAdd}
          onChange={(field, value) => handleNewCurrencyChange(field, value)}
          isLoading={isLoading}
          isNew={true}
        />
      )}

      {editingCurrency && (
        <CurrencyForm
          currency={editingCurrency}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onChange={(field, value) => handleEditChange(field, value)}
          isLoading={isLoading}
          isNew={false}
        />
      )}

      <CurrencyTable
        currencies={currencies}
        onEdit={handleEditCurrency}
        onDelete={handleDeleteCurrency}
        editingCurrency={editingCurrency}
      />
    </div>
  );
}
