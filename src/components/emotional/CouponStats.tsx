import React from 'react';
import { motion } from 'framer-motion';

interface CouponStatsProps {
  activeCoupons: number;
  sentCoupons: number;
  usedCoupons: number;
  totalCoupons: number;
}

const CouponStats: React.FC<CouponStatsProps> = ({ 
  activeCoupons, 
  sentCoupons, 
  usedCoupons, 
  totalCoupons 
}) => {
  // Calculate percentages for progress bars
  const activePercentage = totalCoupons > 0 ? (activeCoupons / totalCoupons) * 100 : 0;
  const sentPercentage = totalCoupons > 0 ? (sentCoupons / (totalCoupons * 5)) * 100 : 0; // Assuming 5 sends per coupon is "full"
  const usedPercentage = sentCoupons > 0 ? (usedCoupons / sentCoupons) * 100 : 0;
  
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const stats = [
    { 
      title: 'Active Coupons', 
      value: activeCoupons, 
      icon: '🔥', 
      color: 'from-amber-500 to-orange-500',
      percentage: activePercentage,
      description: 'Currently delighting customers'
    },
    { 
      title: 'Sent Coupons', 
      value: sentCoupons, 
      icon: '✉️', 
      color: 'from-blue-500 to-cyan-500',
      percentage: sentPercentage,
      description: 'Shared with your customers'
    },
    { 
      title: 'Used Coupons', 
      value: usedCoupons, 
      icon: '🎯', 
      color: 'from-green-500 to-emerald-500',
      percentage: usedPercentage,
      description: 'Successfully redeemed'
    },
    { 
      title: 'Total Coupons', 
      value: totalCoupons, 
      icon: '🏆', 
      color: 'from-purple-500 to-indigo-500',
      percentage: 100,
      description: 'Created for your business'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${stat.color.split(' ')[0].replace('from-', '')}, ${stat.color.split(' ')[1].replace('to-', '')})` }}>
                {stat.value}
              </span>
              <span className="ml-2 text-sm text-gray-500">{stat.description}</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stat.percentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CouponStats;