import React from 'react';
import { Currency } from '@/services/regional';
import { Pencil, Trash2 } from 'lucide-react';

interface CurrencyTableProps {
  currencies: Currency[];
  onEdit: (currency: Currency) => void;
  onDelete: (currencyCode: string) => void;
  editingCurrency: Currency | null;
}

export function CurrencyTable({
  currencies,
  onEdit,
  onDelete,
  editingCurrency
}: CurrencyTableProps) {
  return (
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
                  onClick={() => onEdit(currency)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                  disabled={editingCurrency !== null}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(currency.code)}
                  className="text-red-600 hover:text-red-900"
                  disabled={editingCurrency !== null}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}