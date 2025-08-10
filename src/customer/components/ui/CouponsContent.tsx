import React from 'react';
import CustomerCoupons from '../../CustomerCoupons';
import { ExtendedUser } from '../../../contexts/auth/types/extendedTypes';

interface CouponsContentProps {
  user: ExtendedUser | null;
  mascotEmoji: string;
  onCouponAction: (message: string) => void;
}

const CouponsContent: React.FC<CouponsContentProps> = ({
  user,
  mascotEmoji,
  onCouponAction
}) => {
  return (
    <div className="bg-white rounded-t-3xl shadow-lg px-4 py-6 min-h-screen">
      {user ? (
        <CustomerCoupons viewMode="simple" onCouponAction={onCouponAction} />
      ) : (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{mascotEmoji}</div>
            <p>Please log in to view your coupons.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsContent;