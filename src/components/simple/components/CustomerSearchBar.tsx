import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CustomerSearchBarProps {
  onSearch: (query: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <div className="p-4 border-b border-gray-200">
      <motion.div 
        className={`flex items-center bg-gray-100 rounded-lg px-3 py-2 ${
          isFocused ? 'ring-2 ring-amber-300' : ''
        }`}
        animate={{ 
          backgroundColor: isFocused ? '#FFF7ED' : '#F3F4F6' 
        }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          type="text"
          placeholder="Search your valued customers..."
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none ml-2 text-gray-700 placeholder-gray-500"
        />
        
        {query && (
          <motion.button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default CustomerSearchBar;