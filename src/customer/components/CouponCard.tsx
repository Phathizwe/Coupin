import React, { useState } from 'react';
import { Coupon } from '../../customer/types/coupon';
import { redeemCoupon, copyCouponCode, trackCouponEvent, CouponAnalyticsEvent } from '../services/couponService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/dateUtils';

interface CouponCardProps {
  coupon: Coupon;
  onRedeem?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onRedeem, onCopy }) => {
  const { user } = useAuth();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const isExpired = new Date(coupon.endDate) < new Date();
  const isRedeemed = coupon.status === 'redeemed';
  
  // Get primary and secondary colors from coupon's business, or use defaults
  const primaryColor = coupon.businessColors?.primary || '#3B82F6';
  const secondaryColor = coupon.businessColors?.secondary || '#10B981';

  // Handle coupon redemption
  const handleRedeem = async () => {
    if (!user || isRedeeming || isRedeemed || isExpired) return;
    if (!coupon.distributionId) {
      alert('Cannot redeem this coupon. Distribution ID is missing.');
      return;
    }
    
    setIsRedeeming(true);
    try {
      const success = await redeemCoupon(coupon.distributionId);
      if (success) {
        if (onRedeem) onRedeem(coupon);
        alert(`Coupon ${coupon.code} has been redeemed successfully!`);
      } else {
        alert('Failed to redeem coupon. Please try again.');
      }

      // Track redemption event
      await trackCouponEvent(coupon.id, user.uid, CouponAnalyticsEvent.REDEEM);
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      alert('An error occurred while redeeming the coupon.');
    } finally {
      setIsRedeeming(false);
    }
  };
  
  // Handle copying coupon code
  const handleCopyCode = async () => {
    if (!user || isCopying) return;
    
    setIsCopying(true);
    try {
      const success = await copyCouponCode(coupon.code);
      if (success) {
        if (onCopy) onCopy(coupon);
        alert(`Coupon code ${coupon.code} copied to clipboard!`);
      } else {
        alert('Failed to copy coupon code. Please try again.');
      }

      // Track copy event
      await trackCouponEvent(coupon.id, user.uid, CouponAnalyticsEvent.COPY);
    } catch (error) {
      console.error('Error copying coupon code:', error);
      alert('An error occurred while copying the coupon code.');
    } finally {
      setIsCopying(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Coupon header with business info - now styled with the business colors */}
      <div 
        className="p-3 border-b flex items-center"
        style={{ backgroundColor: primaryColor + '10' }}
      >
        {coupon.businessLogo ? (
          <img 
            src={coupon.businessLogo} 
            alt={coupon.businessName} 
            className="w-10 h-10 rounded-full mr-3 object-cover border-2"
            style={{ borderColor: primaryColor }}
            onError={(e) => {
              e.currentTarget.src = '/assets/placeholder-coupon.png';
            }}
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="font-semibold">
              {coupon.businessName?.charAt(0) || 'B'}
            </span>
          </div>
        )}
        <div>
          <h3 
            className="font-medium"
            style={{ color: primaryColor }}
          >
            {coupon.businessName}
          </h3>
          <p className="text-xs text-gray-500">Valid until {formatDate(coupon.endDate)}</p>
        </div>
      </div>
      
      {/* Coupon content */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">{coupon.title}</h2>
        <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>

        <div className="bg-gray-100 p-3 rounded-md mb-3 flex justify-between items-center">
          <div className="font-mono text-lg font-semibold">{coupon.code}</div>
          <button 
            onClick={handleCopyCode}
            disabled={isCopying}
            className="text-sm font-medium hover:opacity-80"
            style={{ color: secondaryColor }}
          >
            {isCopying ? 'Copying...' : 'Copy'}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div 
            className="text-lg font-bold"
            style={{ color: secondaryColor }}
          >
            {coupon.discount}
          </div>

          {isRedeemed ? (
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              Redeemed
            </span>
          ) : isExpired ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              Expired
            </span>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="px-4 py-2 text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;