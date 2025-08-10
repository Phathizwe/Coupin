import React from 'react';
import { motion } from 'framer-motion';

interface EmotionalStatsSectionProps {
  activeCoupons: number;
  totalRedemptions: number;
  loyalCustomers: number;
}

const EmotionalStatsSection: React.FC<EmotionalStatsSectionProps> = ({
  activeCoupons,
  totalRedemptions,
  loyalCustomers
}) => {
  // Get today's date
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get this week's range
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const weekRange = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="grid grid-cols-1 gap-4">
      <motion.div 
        className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center">
          <div className="mr-3 bg-white/30 rounded-full p-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-white/80">🎉 Today: {dayName}</p>
            <p className="text-lg font-bold text-white">
              {totalRedemptions > 0 ? `${totalRedemptions} happy customers returned!` : 'Ready to welcome customers!'}
            </p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center">
          <div className="mr-3 bg-white/30 rounded-full p-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-white/80">📈 This week: {weekRange}</p>
            <p className="text-lg font-bold text-white">
              {loyalCustomers > 0 ? `${loyalCustomers} relationships built` : 'Start building relationships!'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmotionalStatsSection;