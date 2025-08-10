import React from 'react';
import { Coupon } from '../../types';
import { getCouponStatusLabel, getCouponStatusColor } from './CouponUtils';

interface MobileCouponsListProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
}

const MobileCouponsList: React.FC<MobileCouponsListProps> = ({
  coupons,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {coupons.map((coupon) => {
        const status = getCouponStatusLabel(coupon);
        const statusColor = getCouponStatusColor(status);
        
        return (
          <div 
            key={coupon.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
          >
            {/* Coupon Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{coupon.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                  {status}
                </span>
              </div>
            </div>
            
            {/* Coupon Details */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="text-sm font-medium">{coupon.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-sm font-medium">
                    {coupon.type === 'percentage' && `${coupon.value}% off`}
                    {coupon.type === 'fixed' && `$${coupon.value.toFixed(2)} off`}
                    {coupon.type === 'buyXgetY' && `Buy ${coupon.buyQuantity} get ${coupon.getQuantity}`}
                    {coupon.type === 'freeItem' && `Free ${coupon.freeItem}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid From</p>
                  <p className="text-sm">{new Date(coupon.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Valid Until</p>
                  <p className="text-sm">{new Date(coupon.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Usage</p>
                  <p className="text-sm">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sent</p>
                  <p className="text-sm">{coupon.distributionCount || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex border-t border-gray-100">
              <button 
                className="flex-1 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50"
                onClick={() => onEdit(coupon)}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit
                </div>
              </button>
              <div className="w-px bg-gray-100"></div>
              <button 
                className={`flex-1 py-3 text-sm font-medium ${coupon.active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                onClick={() => onToggleStatus(coupon)}
              >
                <div className="flex items-center justify-center">
                  {coupon.active ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Deactivate
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Activate
                    </>
                  )}
                </div>
              </button>
              <div className="w-px bg-gray-100"></div>
              <button 
                className="flex-1 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => onDelete(coupon.id)}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete
                </div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileCouponsList;