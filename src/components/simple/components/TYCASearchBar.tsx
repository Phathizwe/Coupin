import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface TYCASearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const TYCASearchBar: React.FC<TYCASearchBarProps> = ({
  onSearch,
  placeholder = 'Search...'
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.div
      className={`relative mb-4 rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
        isFocused ? `ring-2 ring-[${BRAND_COLORS.primary[300]}]` : 'ring-1 ring-gray-200'
      }`}
      animate={{
        boxShadow: isFocused ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center">
        <div className="pl-4 pr-2">
          <svg className={`w-5 h-5 ${isFocused ? `text-[${BRAND_COLORS.primary[600]}]` : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="flex-1 py-3 px-2 outline-none text-gray-700 placeholder-gray-400"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <motion.button
            className="pr-4 pl-2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default TYCASearchBar;