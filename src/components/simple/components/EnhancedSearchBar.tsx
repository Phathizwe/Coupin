import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  placeholder = 'Search coupons...',
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.div
      className={`relative mb-4 rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${isFocused ? 'shadow-md ring-2 ring-amber-200' : 'ring-1 ring-gray-200'
        }`}
      animate={{ scale: isFocused ? 1.01 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <form onSubmit={handleSearch} className="flex items-center">
        <motion.span
          className={`pl-4 ${isFocused ? 'text-amber-500' : 'text-gray-400'}`}
          animate={{
            rotate: isFocused ? [0, -10, 10, -10, 0] : 0,
            scale: isFocused ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 px-4 outline-none bg-transparent text-gray-700"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="pr-4 text-gray-400 hover:text-gray-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {/* Enhanced search suggestions with animations */}
      <AnimatePresence>
        {isFocused && query.length >= 2 && (
          <motion.div
            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-1 text-xs text-gray-500 font-medium">Suggestions</div>
            <div className="border-t border-gray-100 mt-1 pt-1">
              {['10% OFF', 'Buy 1 Get 1', 'Free Appetizer'].map((suggestion, index) => (
                query.toLowerCase() === suggestion.toLowerCase().substring(0, query.length) && (
                  <motion.button
                    key={index}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    onClick={() => {
                      setQuery(suggestion);
                      onSearch(suggestion);
                      setIsFocused(false);
                    }}
                    whileHover={{ x: 5, backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="font-medium text-amber-600">{query}</span>
                    {suggestion.substring(query.length)}
                  </motion.button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedSearchBar;