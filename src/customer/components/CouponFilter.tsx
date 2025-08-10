import React from 'react';

export interface CouponFilterProps {
  currentFilter: 'all' | 'active' | 'expired' | 'redeemed';
  onFilterChange: (filter: 'all' | 'active' | 'expired' | 'redeemed') => void;
  // Make these props optional
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  couponCount?: number;
  // Add the missing props
  onSortChange?: (sort: 'value' | 'endDate' | 'startDate' | 'businessName', direction: 'asc' | 'desc') => void;
  currentSort?: 'value' | 'endDate' | 'startDate' | 'businessName';
  currentDirection?: 'asc' | 'desc';
}

const CouponFilter: React.FC<CouponFilterProps> = ({
  searchQuery = '',
  onSearchChange,
  currentFilter,
  onFilterChange,
  couponCount = 0,
  // Add the new props with default values
  onSortChange,
  currentSort = 'endDate',
  currentDirection = 'asc'
}) => {
  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  // Add a handler for sort changes if onSortChange is provided
  const handleSortChange = (sort: 'value' | 'endDate' | 'startDate' | 'businessName') => {
    if (onSortChange) {
      // If clicking on the current sort field, toggle direction, otherwise use default 'asc'
      const newDirection = (sort === currentSort && currentDirection === 'asc') ? 'desc' : 'asc';
      onSortChange(sort, newDirection);
    }
};

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Filter Coupons</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Search Input - only show if onSearchChange is provided */}
        {onSearchChange && (
          <div>
            <label htmlFor="search-coupons" className="block text-sm font-medium text-gray-700 mb-1">
              Search Coupons
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search-coupons"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by title, business, or code"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>
        )}
        
        {/* Filter Tabs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentFilter === 'all' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
              All {couponCount > 0 && `(${couponCount})`}
            </button>
            <button
              onClick={() => onFilterChange('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentFilter === 'active' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onFilterChange('expired')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentFilter === 'expired' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => onFilterChange('redeemed')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentFilter === 'redeemed' 
                  ? 'bg-primary-100 text-primary-700 border-primary-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Redeemed
            </button>
        </div>
      </div>
    </div>
    
    {/* Add sorting options if onSortChange is provided */}
    {onSortChange && (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSortChange('endDate')}
            className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
              currentSort === 'endDate' 
                ? 'bg-primary-100 text-primary-700 border-primary-300' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Expiry Date
            {currentSort === 'endDate' && (
              <span className="ml-1">
                {currentDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSortChange('startDate')}
            className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
              currentSort === 'startDate' 
                ? 'bg-primary-100 text-primary-700 border-primary-300' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Start Date
            {currentSort === 'startDate' && (
              <span className="ml-1">
                {currentDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSortChange('businessName')}
            className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
              currentSort === 'businessName' 
                ? 'bg-primary-100 text-primary-700 border-primary-300' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Business
            {currentSort === 'businessName' && (
              <span className="ml-1">
                {currentDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <button
            onClick={() => handleSortChange('value')}
            className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
              currentSort === 'value' 
                ? 'bg-primary-100 text-primary-700 border-primary-300' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Value
            {currentSort === 'value' && (
              <span className="ml-1">
                {currentDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default CouponFilter;