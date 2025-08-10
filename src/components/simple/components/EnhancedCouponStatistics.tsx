import React from 'react';
import { motion } from 'framer-motion';

interface StatItem {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

interface EnhancedCouponStatisticsProps {
  stats: StatItem[];
}

const EnhancedCouponStatistics: React.FC<EnhancedCouponStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.95)"
          }}
        >
          <div className="flex items-center mb-2">
            <motion.div
              className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mr-3 shadow-sm`}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-lg">{stat.icon}</span>
            </motion.div>
            <div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              <motion.div
                className="text-xl font-bold"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {stat.value}
              </motion.div>
            </div>
          </div>

          {stat.change && (
            <div className="flex items-center text-xs">
              <motion.span
                className={`mr-1 ${stat.change.isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              >
                {stat.change.isPositive ? '↑' : '↓'} {Math.abs(stat.change.value)}%
              </motion.span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default EnhancedCouponStatistics;