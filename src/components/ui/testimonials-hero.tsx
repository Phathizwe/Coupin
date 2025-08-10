import React from 'react';
import { motion } from 'framer-motion';

interface TestimonialsHeroProps {
  title?: string;
  subtitle?: string;
}

export const TestimonialsHero: React.FC<TestimonialsHeroProps> = ({
  title = "What Our Customers Say",
  subtitle = "Discover how our solutions have helped businesses like yours succeed"
}) => {
  return (
    <div className="relative bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20"></div>
          <div className="absolute top-1/4 -right-20 w-60 h-60 bg-primary-300 dark:bg-primary-800 rounded-full opacity-10"></div>
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-primary-100 dark:bg-primary-700 rounded-full opacity-10"></div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsHero;