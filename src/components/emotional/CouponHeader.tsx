import React from 'react';
import { motion } from 'framer-motion';

interface CouponHeaderProps {
  userName: string;
  onCreateCoupon: () => void;
}

const CouponHeader: React.FC<CouponHeaderProps> = ({ userName, onCreateCoupon }) => {
  // Get time of day for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here are your special offers ready to delight customers</p>
        </motion.div>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full 
                    font-medium shadow-lg flex items-center gap-2 hover:shadow-purple-200/50 transition-all"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateCoupon}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Coupon
        </motion.button>
      </div>
      
      <motion.div 
        className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
    </div>
  );
};

export default CouponHeader;