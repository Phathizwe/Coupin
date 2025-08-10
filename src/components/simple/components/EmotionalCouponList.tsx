import React from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import EnhancedCouponCard, { CouponData } from './EnhancedCouponCard';
import EnhancedEmptyState from './EnhancedEmptyState';
interface EmotionalCouponListProps {
  coupons: CouponData[];
  selectedCoupon: string | null;
  onSelectCoupon: (id: string) => void;
  onCopyCode: (code: string) => void;
  onCreateCoupon: () => void;
  searchQuery: string;
}

const EmotionalCouponList: React.FC<EmotionalCouponListProps> = ({
  coupons,
  selectedCoupon,
  onSelectCoupon,
  onCopyCode,
  onCreateCoupon,
  searchQuery
}) => {
  return (
    <LayoutGroup>
      {coupons.length > 0 ? (
        <motion.div 
          className="space-y-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {coupons.map((coupon, index) => (
              <motion.div
                key={coupon.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EnhancedCouponCard 
                  coupon={coupon}
                  onSelect={onSelectCoupon}
                  onCopy={onCopyCode}
                  selected={selectedCoupon === coupon.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EnhancedEmptyState 
          title="No coupons found"
          message={
            searchQuery 
              ? "We couldn't find any coupons matching your search. Try different keywords or clear filters." 
              : "You don't have any coupons yet. Create your first coupon to start attracting customers!"
          }
          actionLabel="Create Coupon"
          onAction={onCreateCoupon}
        />
      )}
    </LayoutGroup>
  );
};

export default EmotionalCouponList;