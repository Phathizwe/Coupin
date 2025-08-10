import React from 'react';

interface StoreSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showOnlyWithCoupons: boolean;
  setShowOnlyWithCoupons: (value: boolean) => void;
}

const StoreSearchFilter: React.FC<StoreSearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  showOnlyWithCoupons,
  setShowOnlyWithCoupons
}) => {
  return (
    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search stores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center">
        <label htmlFor="coupon-toggle" className="mr-3 text-sm font-medium text-gray-700">
          Show only stores with coupons
        </label>
        <button
          type="button"
          id="coupon-toggle"
          className={`${
            showOnlyWithCoupons ? 'bg-primary-600' : 'bg-gray-200'
          } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          role="switch"
          aria-checked={showOnlyWithCoupons}
          onClick={() => setShowOnlyWithCoupons(!showOnlyWithCoupons)}
        >
          <span
            aria-hidden="true"
            className={`${
              showOnlyWithCoupons ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
          ></span>
        </button>
      </div>
    </div>
  );
};

export default StoreSearchFilter;