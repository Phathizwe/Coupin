import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

interface TYCACouponStatisticsProps {
  stats: StatItem[];
}

const TYCACouponStatistics: React.FC<TYCACouponStatisticsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ 
            y: -5, 
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div className={`${stat.color} w-10 h-10 rounded-full flex items-center justify-center mb-2`}>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <p className="text-xs text-white/80 text-center">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
          
                {stat.change && (
            <div className={`text-xs mt-1 flex items-center ${
              stat.change.isPositive ? 'text-green-300' : 'text-red-300'
            }`}>
              <span>
                {stat.change.isPositive ? '↑' : '↓'} {stat.change.value}%
              </span>
          </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TYCACouponStatistics;