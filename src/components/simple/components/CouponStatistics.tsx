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

interface CouponStatisticsProps {
  stats: StatItem[];
}

const CouponStatistics: React.FC<CouponStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mr-3`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
          </div>
          
          {stat.change && (
            <div className="flex items-center text-xs">
              <span className={`mr-1 ${stat.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change.isPositive ? '↑' : '↓'} {Math.abs(stat.change.value)}%
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CouponStatistics;