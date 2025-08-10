import React from 'react';
import { Coupon } from '../../types';

interface CouponPreviewProps {
  coupon: Coupon;
}

const CouponPreview: React.FC<CouponPreviewProps> = ({ coupon }) => {
  const formatDate = (date: Date) => {
    return date instanceof Date 
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Invalid date';
  };

  const getDiscountText = () => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `$${coupon.value} OFF`;
      case 'buyXgetY':
        return `BUY ${coupon.buyQuantity} GET ${coupon.getQuantity}`;
      case 'freeItem':
        return `FREE ${coupon.freeItem}`;
      default:
        return 'SPECIAL OFFER';
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
      style={{ 
        backgroundColor: coupon.branding?.backgroundColor || '#ffffff',
        color: coupon.branding?.textColor || '#000000'
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase font-bold mb-1">COUPON CODE</div>
            <div className="text-lg font-bold tracking-wider mb-2">{coupon.code}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{getDiscountText()}</div>
            {coupon.minPurchase !== undefined && coupon.minPurchase > 0 && (
              <div className="text-xs mt-1">Min. purchase: ${coupon.minPurchase}</div>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <h3 className="text-xl font-bold">{coupon.title}</h3>
          {coupon.description && (
            <p className="text-sm mt-1">{coupon.description}</p>
          )}
        </div>
        
        <div className="mt-4 text-xs">
          <div className="flex justify-between">
            <span>Valid from: {formatDate(coupon.startDate)}</span>
            <span>Expires: {formatDate(coupon.endDate)}</span>
          </div>
        </div>
        
        {coupon.termsAndConditions && (
          <div className="mt-3 text-xs">
            <p className="italic">*{coupon.termsAndConditions}</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-2 text-center text-xs" style={{ color: '#666' }}>
        Scan or present this coupon at checkout
      </div>
    </div>
  );
};

export default CouponPreview;