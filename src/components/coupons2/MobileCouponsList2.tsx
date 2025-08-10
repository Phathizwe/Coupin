import React from 'react';
import { Coupon } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface MobileCouponsList2Props {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
}

const MobileCouponsList2: React.FC<MobileCouponsList2Props> = ({
  coupons,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  // Function to determine coupon status
  const getCouponStatus = (coupon: Coupon): { status: string; color: string } => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    if (!coupon.active) {
      return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    } else if (now < startDate) {
      return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
    } else if (now > endDate) {
      return { status: 'Expired', color: 'bg-red-100 text-red-800' };
    } else {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    }
  };

  // Function to format discount display based on coupon type
  const getDiscountDisplay = (coupon: Coupon): string => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}%`;
      case 'fixed':
        return `$${coupon.value}`;
      case 'buyXgetY':
        return `Buy ${coupon.buyQuantity}, Get ${coupon.getQuantity}`;
      case 'freeItem':
        return `Free ${coupon.freeItem || 'item'}`;
      default:
        return `${coupon.value}`;
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {coupons.map((coupon) => {
        const { status, color } = getCouponStatus(coupon);
        
        return (
          <div key={coupon.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {coupon.title || 'Untitled Coupon'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {coupon.description || 'No description'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${color}`}>
                  {status}
                </span>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Code</p>
                <p className="text-sm font-medium">{coupon.code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Discount</p>
                <p className="text-sm font-medium">
                  {getDiscountDisplay(coupon)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valid Period</p>
                <p className="text-sm font-medium">
                  {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Redemptions</p>
                <p className="text-sm font-medium">
                  {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                </p>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => onEdit(coupon)}
                className="text-primary-600 hover:text-primary-900"
                title="Edit coupon"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                onClick={() => onToggleStatus(coupon)}
                className={coupon.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                title={coupon.active ? "Deactivate coupon" : "Activate coupon"}
              >
                {coupon.active ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
              </button>
              <button
                onClick={() => onDelete(coupon.id)}
                className="text-red-600 hover:text-red-900"
                title="Delete coupon"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileCouponsList2;