import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CouponCard from './CouponCard';

interface Coupon {
  id: string;
  title: string;
  code: string;
  discount: string;
  status: string;
  validFrom: string;
  validUntil: string;
  usage: {
    used: number;
    limit: number;
  };
  sent: number;
  description?: string;
}

interface CouponsListProps {
  coupons: Coupon[];
  loading: boolean;
  onCouponAction: (action: string) => void;
  viewMode?: 'detailed' | 'simple';
}

const CouponsList: React.FC<CouponsListProps> = ({ 
  coupons, 
  loading, 
  onCouponAction,
  viewMode = 'detailed'
}) => {
  // Animation variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mb-4"
        />
        <p className="text-gray-500 animate-pulse">Loading your amazing coupons...</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-md p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-5xl mb-4">🎁</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No coupons found</h3>
        <p className="text-gray-600 mb-6">Time to create some special offers for your customers!</p>
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full 
                    font-medium shadow-lg hover:shadow-purple-200/50 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCouponAction('create')}
        >
          Create Your First Coupon
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 ${
        viewMode === 'simple' 
          ? 'md:grid-cols-1 lg:grid-cols-2' 
          : 'md:grid-cols-2 lg:grid-cols-3'
      } gap-6`}
    >
      <AnimatePresence>
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            variants={itemVariants}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            layout
          >
            <CouponCard 
              coupon={coupon} 
              onAction={onCouponAction} 
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default CouponsList;