import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_COLORS } from '../../../constants/brandConstants';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface TYCAFilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  showExpandedByDefault?: boolean;
}

const TYCAFilterBar: React.FC<TYCAFilterBarProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  showExpandedByDefault = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpandedByDefault);

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-sm font-medium text-[${BRAND_COLORS.primary[700]}]`}>Filter Coupons</h3>
        <motion.button
          className="text-gray-500 text-sm flex items-center"
          onClick={toggleExpanded}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Less' : 'More'}
          <svg
            className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.slice(0, isExpanded ? filters.length : 2).map((filter) => (
          <motion.button
            key={filter.id}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
              activeFilter === filter.id
                ? `bg-[${BRAND_COLORS.primary[600]}] text-white`
                : `bg-gray-100 text-gray-700 hover:bg-gray-200`
            }`}
            onClick={() => handleFilterClick(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {filter.icon && <span className="mr-1">{filter.icon}</span>}
            {filter.label}
          </motion.button>
        ))}

        <AnimatePresence>
          {!isExpanded && filters.length > 2 && (
            <motion.button
              className={`px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700`}
              onClick={toggleExpanded}
              whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              +{filters.length - 2} more
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TYCAFilterBar;