import React from 'react';

interface CustomerSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddCustomer?: () => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  totalCustomers?: number;
  placeholder?: string; // Add placeholder prop for emotional design
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddCustomer,
  onSelectAll,
  isAllSelected,
  totalCustomers,
  placeholder = "Search customers..."
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-600">SELECT CUSTOMERS</h2>
        {onSelectAll && (
          <button
            onClick={onSelectAll}
            className="text-sm text-blue-600"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {onAddCustomer && (
        <button
          onClick={onAddCustomer}
          className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          ADD NEW CUSTOMER
        </button>
      )}
    </div>
  );
};

export default CustomerSearchBar;