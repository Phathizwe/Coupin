import React from 'react';
import { Coupon } from '../types/coupon.enhanced';
import CouponCard from './CouponCard.enhanced';

// Export the props interface
export interface CouponListProps {
  coupons: Coupon[];
  onCouponRedeemed: (coupon: Coupon) => void;
}

const CouponList: React.FC<CouponListProps> = ({ coupons, onCouponRedeemed }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coupons.map(coupon => (
        <CouponCard 
          key={coupon.id} 
          coupon={coupon} 
          onRedeem={onCouponRedeemed}
        />
      ))}
    </div>
  );
};

export default CouponList;