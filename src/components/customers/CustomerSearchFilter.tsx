import React from 'react';

interface CustomerSearchFilterProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  hasLoyaltyProgram: boolean;
}

const CustomerSearchFilter: React.FC<CustomerSearchFilterProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  hasLoyaltyProgram
}) => {
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Customers
          </label>
          <div className="flex">
            <input
              type="text"
              id="search"
              className="w-full border-gray-300 rounded-l-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            />
            <button 
              className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700"
              onClick={onSearch}
            >
              Search
            </button>
          </div>
        </div>
        <div className="w-full md:w-48">
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            id="filter"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Customers</option>
            <option value="recent">Recent Customers</option>
            <option value="loyal">Loyal Customers</option>
            <option value="high-value">High Value Customers</option>
            <option value="with-coupons">With Coupons</option>
            <option value="used-coupons">Used Coupons</option>
            {hasLoyaltyProgram && <option value="loyalty-members">Loyalty Members</option>}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchFilter;