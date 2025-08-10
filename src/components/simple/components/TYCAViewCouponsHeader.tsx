import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TYCACouponStatistics from './TYCACouponStatistics';
import { CouponStatistic, TimeOfDay } from '../types/TYCATypes';
import { BRAND_MESSAGES } from '../../../constants/brandConstants';

interface TYCAViewCouponsHeaderProps {
  userName: string;
  timeOfDay: TimeOfDay;
  stats: CouponStatistic[];
  onCreateCoupon: () => void;
}

const TYCAViewCouponsHeader: React.FC<TYCAViewCouponsHeaderProps> = ({
  userName,
  timeOfDay,
  stats,
  onCreateCoupon
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-indigo-500 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="text-white mr-4 bg-white/20 rounded-full p-2"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>

        <motion.h1
          className="text-2xl font-bold flex-1 ml-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Manage Coupons
        </motion.h1>

        <motion.button
          onClick={onCreateCoupon}
          className="bg-white/20 p-2 rounded-full"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </motion.button>
      </div>

      {/* Personalized greeting with TYCA brand messaging */}
      <motion.div
        className="mt-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <p className="text-white/80">{timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : 'Good evening'},</p>
        <h2 className="text-xl font-semibold">{userName}! 👋</h2>
        <p className="text-white/80 text-sm mt-1">{BRAND_MESSAGES.value.standard}</p>
      </motion.div>

      {/* Summary stats in header */}
      <TYCACouponStatistics stats={stats} />
    </header>
  );
};

export default TYCAViewCouponsHeader;