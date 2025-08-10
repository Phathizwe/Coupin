import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface EnhancedFilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  showExpandedByDefault?: boolean;
}

const EnhancedFilterBar: React.FC<EnhancedFilterBarProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  showExpandedByDefault = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpandedByDefault);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  const handleFilterClick = (filterId: string) => {
    onFilterChange(filterId);

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gray-700 font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="mr-2">Filter Coupons</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </motion.button>

        <motion.div
          className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05, backgroundColor: "#fcd34d" }}
        >
          {filters.find(f => f.id === activeFilter)?.label || 'All'}
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-white rounded-xl p-2 shadow-md border border-gray-100 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  className={`p-3 rounded-lg flex items-center ${activeFilter === filter.id
                      ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  onClick={() => handleFilterClick(filter.id)}
                  onHoverStart={() => setHoveredFilter(filter.id)}
                  onHoverEnd={() => setHoveredFilter(null)}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                  }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  <motion.span
                    className="mr-2 text-lg"
                    animate={{
                      scale: hoveredFilter === filter.id ? [1, 1.2, 1] : 1,
                      rotate: hoveredFilter === filter.id ? [0, -5, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {filter.icon}
                  </motion.span>
                  <span className="text-sm font-medium">{filter.label}</span>

                  {activeFilter === filter.id && (
                    <motion.span
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFilterBar;