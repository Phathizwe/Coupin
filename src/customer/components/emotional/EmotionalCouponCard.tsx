import React, { useState } from 'react';
import { Coupon } from '../../../customer/types/coupon';
import { redeemCoupon, copyCouponCode, trackCouponEvent, CouponAnalyticsEvent } from '../../services/couponService';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate } from '../../../utils/dateUtils';
import { BRAND_COLORS } from '../../../constants/brandConstants';

interface EmotionalCouponCardProps {
  coupon: Coupon;
  onRedeem?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

// Animation constants
const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-lg',
    pulse: 'hover:animate-pulse',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

const EmotionalCouponCard: React.FC<EmotionalCouponCardProps> = ({ coupon, onRedeem, onCopy }) => {
  const { user } = useAuth();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [showRedeemFeedback, setShowRedeemFeedback] = useState(false);

  const isExpired = new Date(coupon.endDate) < new Date();
  const isRedeemed = coupon.status === 'redeemed';
  
  // Get primary and secondary colors from coupon's business, or use defaults
  const primaryColor = coupon.businessColors?.primary || BRAND_COLORS.primary[600];
  const secondaryColor = coupon.businessColors?.secondary || BRAND_COLORS.secondary[600];
  
  // Calculate days until expiration
  const daysUntilExpiration = Math.max(0, Math.ceil((new Date(coupon.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  // Handle coupon redemption with emotional feedback
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
        // Show success feedback
        setShowRedeemFeedback(true);
        setTimeout(() => setShowRedeemFeedback(false), 2000);
        
        // Call parent handler
        if (onRedeem) onRedeem(coupon);
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
  
  // Handle copying coupon code with emotional feedback
  const handleCopyCode = async () => {
    if (!user || isCopying) return;
    
    setIsCopying(true);
    try {
      const success = await copyCouponCode(coupon.code);
      if (success) {
        // Show success feedback
        setShowCopiedFeedback(true);
        setTimeout(() => setShowCopiedFeedback(false), 2000);
        
        // Call parent handler
        if (onCopy) onCopy(coupon);
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
    <div 
      className={`bg-white rounded-xl overflow-hidden border shadow-sm ${ANIMATIONS.transition.medium} ${
        isExpanded 
          ? 'shadow-xl scale-[1.02]' 
          : 'hover:shadow-md hover:scale-[1.01]'
      }`}
      style={{ 
        borderColor: isExpired ? '#d1d5db' : isRedeemed ? '#10B981' : primaryColor + '40',
        borderWidth: '1px' 
      }}
    >
      {/* Status indicator */}
      {isRedeemed && (
        <div 
          className="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: '#10B981' }}
        >
          Redeemed
        </div>
      )}
      
      {isExpired && !isRedeemed && (
        <div className="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-medium rounded-full text-white bg-gray-500">
          Expired
        </div>
      )}
      
      {!isExpired && !isRedeemed && daysUntilExpiration <= 3 && (
        <div className="absolute top-0 right-0 m-2 px-2 py-1 text-xs font-medium rounded-full text-white bg-amber-500 animate-pulse">
          Expires soon!
        </div>
      )}
      
      {/* Coupon header with business info - now with premium gradient */}
      <div 
        className="p-4 flex items-center"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}30)` 
        }}
      >
        {coupon.businessLogo ? (
          <img 
            src={coupon.businessLogo} 
            alt={coupon.businessName} 
            className={`w-12 h-12 rounded-full mr-4 object-cover border-2 ${ANIMATIONS.transition.medium}`}
            style={{ borderColor: primaryColor }}
            onError={(e) => {
              e.currentTarget.src = '/assets/placeholder-coupon.png';
            }}
          />
        ) : (
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white ${ANIMATIONS.transition.medium}`}
            style={{ backgroundColor: primaryColor }}
          >
            <span className="font-semibold text-lg">
              {coupon.businessName?.charAt(0) || 'B'}
            </span>
          </div>
        )}
        <div>
          <h3 
            className="font-semibold text-lg"
            style={{ color: primaryColor }}
          >
            {coupon.businessName}
          </h3>
          <div className="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Valid until {formatDate(coupon.endDate)}
          </div>
        </div>
      </div>
      
      {/* Coupon content with enhanced visual design */}
      <div className="p-5">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{coupon.title}</h2>
          <p className="text-gray-600 text-sm">{coupon.description}</p>
        </div>

        {/* Discount value with premium styling */}
        <div 
          className={`mb-4 py-3 px-4 rounded-lg flex items-center justify-between ${ANIMATIONS.transition.fast}`}
          style={{ 
            background: `linear-gradient(135deg, ${secondaryColor}10, ${secondaryColor}25)`,
            borderLeft: `4px solid ${secondaryColor}`
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: secondaryColor }}
          >
            {coupon.discount}
          </div>
          
          <div className="text-sm text-gray-500">
            {isRedeemed 
              ? `Redeemed ${coupon.redeemedAt ? formatDate(coupon.redeemedAt) : ''}` 
              : isExpired 
                ? 'Expired' 
                : daysUntilExpiration === 0 
                  ? 'Expires today!' 
                  : `${daysUntilExpiration} days left`
            }
          </div>
        </div>

        {/* Coupon code with copy button and feedback */}
        <div className="relative mb-5">
          <div 
            className={`bg-gray-100 p-4 rounded-lg flex justify-between items-center ${
              showCopiedFeedback ? 'bg-green-50 border border-green-200' : ''
            } ${ANIMATIONS.transition.medium}`}
          >
            <div className="font-mono text-lg font-semibold">{coupon.code}</div>
            <button 
              onClick={handleCopyCode}
              disabled={isCopying}
              className={`px-3 py-1 rounded-md text-sm font-medium ${ANIMATIONS.transition.fast} ${
                isCopying ? 'opacity-50' : 'hover:opacity-80'
              }`}
              style={{ 
                color: 'white',
                backgroundColor: secondaryColor
              }}
            >
              {isCopying ? 'Copying...' : showCopiedFeedback ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          
          {/* Copy success feedback */}
          {showCopiedFeedback && (
            <div className={`absolute -top-8 left-0 right-0 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm text-center ${ANIMATIONS.transition.fast} ${ANIMATIONS.celebrate.tada}`}>
              Code copied to clipboard! 📋
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          {/* Details toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm font-medium text-gray-500 flex items-center ${ANIMATIONS.transition.fast} hover:text-gray-700`}
          >
            {isExpanded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Less
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Details
              </>
            )}
          </button>

          {/* Redeem button */}
          <div className="relative">
            {isRedeemed ? (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Redeemed
              </div>
            ) : isExpired ? (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                Expired
              </div>
            ) : (
              <button
                onClick={handleRedeem}
                disabled={isRedeeming}
                className={`px-5 py-2 text-white rounded-lg text-sm font-medium ${ANIMATIONS.transition.medium} ${
                  isRedeeming ? 'opacity-50' : `hover:shadow-md ${ANIMATIONS.hover.scale}`
                }`}
                style={{ backgroundColor: primaryColor }}
              >
                {isRedeeming ? 'Redeeming...' : showRedeemFeedback ? 'Redeemed!' : 'Redeem Now'}
              </button>
            )}
            
            {/* Redeem success feedback */}
            {showRedeemFeedback && (
              <div className={`absolute -top-8 left-0 right-0 bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm text-center ${ANIMATIONS.transition.fast} ${ANIMATIONS.celebrate.tada}`}>
                Coupon redeemed successfully! 🎉
              </div>
            )}
          </div>
        </div>
        
        {/* Expanded details section */}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t border-gray-100 ${ANIMATIONS.transition.medium}`}>
            {coupon.terms && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Terms & Conditions</h4>
                <p className="text-xs text-gray-600">{coupon.terms}</p>
              </div>
            )}
            
            <div className="flex justify-between text-xs text-gray-500">
              <div>
                <span className="font-medium">Valid from:</span> {formatDate(coupon.startDate)}
              </div>
              <div>
                <span className="font-medium">Expires:</span> {formatDate(coupon.endDate)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalCouponCard;