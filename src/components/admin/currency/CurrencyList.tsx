import React from 'react';
import { Currency } from '@/services/currencyService';

interface CurrencyListProps {
  currencies: Currency[];
  onEditCurrency: (currency: Currency) => void;
  onDeleteCurrency: (currencyCode: string) => void;
  isDeleting: { [key: string]: boolean };
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  onEditCurrency,
  onDeleteCurrency,
  isDeleting
}) => {
  if (currencies.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No currencies found. Add your first currency to get started.</p>
      </div>
    );
  }

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
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  currency.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {currency.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {currency.updatedAt ? new Date(currency.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditCurrency(currency)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteCurrency(currency.code)}
                  disabled={isDeleting[currency.code]}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {isDeleting[currency.code] ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyList;