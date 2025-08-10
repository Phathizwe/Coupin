import React from 'react';
import { LoyaltyFilters } from '../types/loyalty';

interface LoyaltyFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentFilter: 'all' | 'active';
  onFilterChange: (filter: 'all' | 'active') => void;
  programCount: number;
}

const LoyaltyFilter: React.FC<LoyaltyFilterProps> = ({
  searchQuery,
  onSearchChange,
  currentFilter,
  onFilterChange,
  programCount
}) => {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search loyalty programs..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {programCount} {programCount === 1 ? 'program' : 'programs'}
          </span>
          
          <div className="relative inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                currentFilter === 'all'
                  ? 'bg-indigo-50 text-indigo-600 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('active')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                currentFilter === 'active'
                  ? 'bg-indigo-50 text-indigo-600 z-10'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } -ml-px`}
            >
              Active
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyFilter;