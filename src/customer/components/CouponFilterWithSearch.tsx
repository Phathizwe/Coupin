import React, { useState } from 'react';
import CouponFilter from './CouponFilter';

interface CouponFilterWithSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (status: 'all' | 'active' | 'expired' | 'redeemed') => void;
  onSortChange: (sort: 'endDate' | 'startDate' | 'businessName' | 'value', direction: 'asc' | 'desc') => void;
  currentFilter: 'all' | 'active' | 'expired' | 'redeemed';
  currentSort: 'endDate' | 'startDate' | 'businessName' | 'value';
  currentDirection: 'asc' | 'desc';
}

const CouponFilterWithSearch: React.FC<CouponFilterWithSearchProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  currentFilter,
  currentSort,
  currentDirection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search your coupons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium text-primary-600"
        >
          Search
        </button>
      </form>
      
      <CouponFilter
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
        currentFilter={currentFilter}
        currentSort={currentSort}
        currentDirection={currentDirection}
      />
    </div>
  );
};

export default CouponFilterWithSearch;