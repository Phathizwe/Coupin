import React from 'react';

interface CouponFilters2Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'active' | 'expired' | 'scheduled';
  setFilterStatus: (status: 'all' | 'active' | 'expired' | 'scheduled') => void;
  onRefresh: () => void;
  isMobileView?: boolean;
}

const CouponFilters2: React.FC<CouponFilters2Props> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onRefresh,
  isMobileView = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow mb-6 ${isMobileView ? 'p-4' : 'p-6'}`}>
      <div className={`flex ${isMobileView ? 'flex-col space-y-4' : 'flex-row space-x-4'} items-center`}>
      {/* Search input */}
        <div className={`relative ${isMobileView ? 'w-full' : 'flex-1'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupons..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchTerm && (
        <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
        >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
        </button>
          )}
        </div>

        {/* Status filter */}
        <div className={`${isMobileView ? 'w-full' : ''}`}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'expired' | 'scheduled')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Coupons</option>
            <option value="active">Active Coupons</option>
            <option value="scheduled">Scheduled Coupons</option>
            <option value="expired">Expired Coupons</option>
          </select>
        </div>

        {/* Refresh button - visible only on desktop */}
        {!isMobileView && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
        </button>
        )}
      </div>
    </div>
  );
};

export default CouponFilters2;