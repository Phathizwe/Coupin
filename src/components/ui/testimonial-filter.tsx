import React from 'react';
import { motion } from 'framer-motion';

interface TestimonialFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const TestimonialFilter: React.FC<TestimonialFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          activeCategory === 'all' 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => onCategoryChange('all')}
      >
        All
      </motion.button>
      
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === category 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default TestimonialFilter;