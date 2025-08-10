import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CouponFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  totalCount: number;
  filteredCount: number;
}

const CouponFilters: React.FC<CouponFiltersProps> = ({
  onSearch,
  onFilterChange,
  currentFilter,
  totalCount,
  filteredCount
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };
  
  const filters = [
    { id: 'all', label: 'All Coupons', icon: '🎁' },
    { id: 'active', label: 'Active', icon: '🔥' },
    { id: 'expired', label: 'Expired', icon: '⏰' },
    { id: 'draft', label: 'Drafts', icon: '📝' }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search box with animation */}
        <motion.div 
          className={`relative flex-1 ${isSearchFocused ? 'z-10' : ''}`}
          animate={{ scale: isSearchFocused ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`flex items-center bg-white rounded-full overflow-hidden shadow-sm transition-all duration-300 border ${
            isSearchFocused ? 'border-purple-300 shadow-purple-100' : 'border-gray-200'
          }`}>
            <div className="pl-4 pr-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by coupon name or code..."
              className="py-3 px-2 w-full outline-none text-gray-700"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="pr-4 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchValue('');
                  onSearch('');
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
          
          {/* Search results count */}
          <AnimatePresence>
            {searchValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-4 -bottom-6 text-xs text-gray-500"
              >
                Found {filteredCount} {filteredCount === 1 ? 'coupon' : 'coupons'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-full">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                currentFilter === filter.id 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => onFilterChange(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Results summary */}
      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {currentFilter === 'all' ? 'All Coupons' : 
           currentFilter === 'active' ? 'Active Coupons' :
           currentFilter === 'expired' ? 'Expired Coupons' : 'Draft Coupons'}
        </h2>
        <span className="text-sm text-gray-500">
          Showing {filteredCount} of {totalCount} coupons
        </span>
      </div>
      
      {/* Animated divider */}
      <motion.div 
        className="h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full mt-2"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default CouponFilters;