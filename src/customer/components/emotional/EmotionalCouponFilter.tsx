import React, { useState } from 'react';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface EmotionalCouponFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (status: 'all' | 'active' | 'expired' | 'redeemed') => void;
  onSortChange: (sort: 'endDate' | 'startDate' | 'businessName' | 'value', direction: 'asc' | 'desc') => void;
  currentFilter: 'all' | 'active' | 'expired' | 'redeemed';
  currentSort: 'endDate' | 'startDate' | 'businessName' | 'value';
  currentDirection: 'asc' | 'desc';
}

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-md',
  }
};

const EmotionalCouponFilter: React.FC<EmotionalCouponFilterProps> = ({
  onSearch,
  onFilterChange,
  onSortChange,
  currentFilter,
  currentSort,
  currentDirection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const getFilterLabel = (filter: 'all' | 'active' | 'expired' | 'redeemed') => {
    switch (filter) {
      case 'all': return 'All Coupons';
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      case 'redeemed': return 'Redeemed';
    }
  };
  
  const getSortLabel = (sort: 'endDate' | 'startDate' | 'businessName' | 'value') => {
    switch (sort) {
      case 'endDate': return 'Expiry Date';
      case 'startDate': return 'Start Date';
      case 'businessName': return 'Business Name';
      case 'value': return 'Value';
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search your coupons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-${BRAND_COLORS.primary[300].replace('#', '')} ${ANIMATIONS.transition.fast}`}
          style={{ 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium ${ANIMATIONS.transition.fast}`}
          style={{ color: BRAND_COLORS.primary[600] }}
        >
          Search
        </button>
      </form>
      
      {/* Filter toggle */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${ANIMATIONS.transition.fast} ${
              currentFilter === 'all'
                ? 'text-white'
                : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: currentFilter === 'all' ? BRAND_COLORS.primary[600] : undefined
            }}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('active')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${ANIMATIONS.transition.fast} ${
              currentFilter === 'active'
                ? 'text-white'
                : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: currentFilter === 'active' ? BRAND_COLORS.secondary[600] : undefined
            }}
          >
            Active
          </button>
          <button
            onClick={() => onFilterChange('redeemed')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${ANIMATIONS.transition.fast} ${
              currentFilter === 'redeemed'
                ? 'text-white'
                : 'text-gray-600 bg-gray-100'
            }`}
            style={{ 
              backgroundColor: currentFilter === 'redeemed' ? '#10B981' : undefined
            }}
          >
            Redeemed
          </button>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center text-sm font-medium ${ANIMATIONS.transition.fast}`}
          style={{ color: BRAND_COLORS.primary[600] }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Sort
        </button>
      </div>
      
      {/* Advanced filters (expandable) */}
      {showFilters && (
        <div 
          className={`bg-white rounded-xl p-4 shadow-md border border-gray-100 ${ANIMATIONS.transition.medium}`}
        >
          <h4 className="font-medium text-gray-700 mb-3">Sort by</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSortChange('endDate', currentDirection === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${ANIMATIONS.transition.fast} ${
                currentSort === 'endDate'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Expiry Date</span>
              {currentSort === 'endDate' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {currentDirection === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
            
            <button
              onClick={() => onSortChange('value', currentDirection === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${ANIMATIONS.transition.fast} ${
                currentSort === 'value'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Value</span>
              {currentSort === 'value' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {currentDirection === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
            
            <button
              onClick={() => onSortChange('businessName', currentDirection === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${ANIMATIONS.transition.fast} ${
                currentSort === 'businessName'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Business</span>
              {currentSort === 'businessName' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {currentDirection === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
            
            <button
              onClick={() => onSortChange('startDate', currentDirection === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${ANIMATIONS.transition.fast} ${
                currentSort === 'startDate'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Newest</span>
              {currentSort === 'startDate' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {currentDirection === 'asc' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalCouponFilter;