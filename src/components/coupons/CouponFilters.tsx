import React from 'react';

interface CouponFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'active' | 'expired' | 'scheduled';
  setFilterStatus: (status: 'all' | 'active' | 'expired' | 'scheduled') => void;
  onRefresh: () => void;
  isMobileView?: boolean;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onRefresh,
  isMobileView = false
}) => {
  return (
    <div className={`${isMobileView ? 'flex flex-col space-y-3' : 'flex justify-between items-center'} mb-4`}>
      <h2 className={`${isMobileView ? 'text-lg' : 'text-xl'} font-semibold`}>Your Coupons</h2>
      
      <div className={`${isMobileView ? 'flex flex-col space-y-2 w-full' : 'flex space-x-2'}`}>
        {/* Search input */}
        <div className={`relative ${isMobileView ? 'w-full' : ''}`}>
          <input
            type="text"
            placeholder="Search coupons..."
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isMobileView ? 'w-full' : ''}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        {/* Filter and refresh controls */}
        <div className={`${isMobileView ? 'flex space-x-2' : ''}`}>
          <select 
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isMobileView ? 'flex-grow' : ''}`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="scheduled">Scheduled</option>
          </select>
          
          <button 
            onClick={onRefresh} 
            className={`p-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 ${isMobileView ? 'flex-shrink-0' : ''}`}
            title="Refresh coupons"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponFilters;