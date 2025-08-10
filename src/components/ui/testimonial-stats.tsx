import React from 'react';
import { motion } from 'framer-motion';

interface Stat {
  value: string;
  label: string;
  description?: string;
}

interface TestimonialStatsProps {
  stats: Stat[];
}

export const TestimonialStats: React.FC<TestimonialStatsProps> = ({
  stats = [
    { value: "97%", label: "Customer Satisfaction", description: "Based on post-purchase surveys" },
    { value: "2,500+", label: "Businesses Served", description: "Across various industries" },
    { value: "15M+", label: "Coupons Redeemed", description: "Driving customer loyalty" },
    { value: "30%", label: "Average Revenue Increase", description: "For businesses using our platform" }
  ]
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm"
            >
              <motion.p 
                className="text-4xl font-bold text-primary-600 dark:text-primary-400"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10, 
                  delay: 0.2 + index * 0.1 
                }}
              >
                {stat.value}
              </motion.p>
              <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{stat.label}</p>
              {stat.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialStats;