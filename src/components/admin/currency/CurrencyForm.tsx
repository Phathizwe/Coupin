import React, { useState } from 'react';
import { Currency } from '@/services/currencyService';

interface CurrencyFormProps {
  currency: Partial<Currency>;
  onSubmit?: (currency: Currency) => Promise<void>;
  onSave?: () => Promise<void>;
  onCancel: () => void;
  onChange?: (field: string, value: any) => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
  isNew?: boolean;
}

export const CurrencyForm: React.FC<CurrencyFormProps> = ({
  currency,
  onSubmit,
  onSave,
  onCancel,
  onChange,
  isSubmitting = false,
  isLoading = false,
  isNew = false
}) => {
  const [formData, setFormData] = useState<Partial<Currency>>({
    code: currency.code || '',
    name: currency.name || '',
    symbol: currency.symbol || '',
    isActive: currency.isActive !== undefined ? currency.isActive : true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Call the parent's onChange handler if provided
    if (onChange) {
      onChange(name, newValue);
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Currency code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Currency code must be exactly 3 characters';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Currency name is required';
    }

    if (!formData.symbol?.trim()) {
      newErrors.symbol = 'Currency symbol is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (onSave) {
      await onSave();
    } else if (onSubmit) {
      await onSubmit(formData as Currency);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-md p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">
        {currency.code ? `Edit Currency: ${currency.code}` : 'Add New Currency'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Currency Code (ISO 4217) *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            disabled={!!currency.code} // Disable editing for existing currencies
            placeholder="e.g., USD"
            className={`w-full p-2 border rounded-md ${errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
            maxLength={3}
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
          {!errors.code && (
            <p className="text-xs text-gray-500 mt-1">
              Three-letter ISO currency code (e.g., USD, EUR, GBP)
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Currency Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., US Dollar"
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Currency Symbol *
          </label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g., $"
            className={`w-full p-2 border rounded-md ${errors.symbol ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting || isLoading ? 'Saving...' : 'Save Currency'}
        </button>
      </div>
    </form>
  );
};