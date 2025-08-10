import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';

interface CustomerRelationshipCardProps {
  customer: CustomerWithCouponStats;
  onClick: () => void;
  onAssignCoupon?: () => void;
}

const CustomerRelationshipCard: React.FC<CustomerRelationshipCardProps> = ({
  customer,
  onClick,
  onAssignCoupon
}) => {
  // Calculate relationship strength (simple algorithm)
  const calculateRelationshipStrength = (): number => {
    const visits = customer.totalVisits || 0;
    const spent = customer.totalSpent || 0;
    const couponsUsed = customer.couponStats?.totalUsed || 0;

    const visitScore = Math.min(visits / 10, 1);
    const spendScore = Math.min(spent / 1000, 1);
    const couponScore = Math.min(couponsUsed / 5, 1);

    return (visitScore + spendScore + couponScore) / 3;
  };

  const relationshipStrength = calculateRelationshipStrength();

  // Get relationship status
  const getRelationshipStatus = (): string => {
    if (relationshipStrength > 0.8) return 'Loyal Champion';
    if (relationshipStrength > 0.6) return 'Regular Customer';
    if (relationshipStrength > 0.3) return 'Growing Relationship';
    if (relationshipStrength > 0) return 'New Connection';
    return 'New Customer';
  };

  // Get relationship color
  const getRelationshipColor = (): string => {
    if (relationshipStrength > 0.8) return 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100';
    if (relationshipStrength > 0.6) return 'border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100';
    if (relationshipStrength > 0.3) return 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100';
    return 'border-gray-200 bg-gradient-to-br from-white to-gray-50';
  };

  // Get relationship emoji
  const getRelationshipEmoji = (): string => {
    if (relationshipStrength > 0.8) return '💎';
    if (relationshipStrength > 0.6) return '⭐';
    if (relationshipStrength > 0.3) return '🌱';
    return '👋';
  };

  // Get avatar colors based on relationship strength
  const getAvatarColors = (): string => {
    if (relationshipStrength > 0.8) return 'bg-gradient-to-br from-purple-500 to-purple-600';
    if (relationshipStrength > 0.6) return 'bg-gradient-to-br from-primary-500 to-primary-600';
    if (relationshipStrength > 0.3) return 'bg-gradient-to-br from-blue-500 to-blue-600';
    return 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  // Calculate days since last visit
  const getDaysSinceLastVisit = (): string => {
    if (!customer.lastVisit) return 'Never visited';
    const lastVisit = new Date(customer.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div
      className={`border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 cursor-pointer transform hover:scale-105 ${getRelationshipColor()}`}
      onClick={onClick}
    >
      {/* Header with avatar and basic info */}
      <div className="flex items-center mb-4">
        <div className={`w-14 h-14 rounded-full ${getAvatarColors()} flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md`}>
          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{customer.firstName} {customer.lastName}</h3>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-800 font-medium">{getRelationshipStatus()}</span>
            <span className="ml-2 text-lg">{getRelationshipEmoji()}</span>
          </div>
        </div>
      </div>

      {/* Relationship strength indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-800">Relationship Strength</span>
          <span className="text-xs text-gray-700 font-medium">{Math.round(relationshipStrength * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${relationshipStrength > 0.8 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
              relationshipStrength > 0.6 ? 'bg-gradient-to-r from-primary-400 to-primary-600' :
                relationshipStrength > 0.3 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}
            style={{ width: `${relationshipStrength * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
          <p className="text-xs text-gray-700 font-medium">Visits</p>
          <p className="font-bold text-lg text-gray-900">{customer.totalVisits || 0}</p>
        </div>
        <div className="text-center p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
          <p className="text-xs text-gray-700 font-medium">Spent</p>
          <p className="font-bold text-lg text-gray-900">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Last visit info */}
      <div className="mb-4 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
        <p className="text-xs text-gray-700 font-medium mb-1">Last Visit</p>
        <p className="text-sm text-gray-800 font-medium">{getDaysSinceLastVisit()}</p>
      </div>

      {/* Coupon engagement */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 mb-4">
        <p className="text-xs text-gray-700 font-medium mb-2">Coupon Engagement</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(((customer.couponStats?.totalUsed || 0) / Math.max(customer.couponStats?.totalAllocated || 1, 1)) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-green-600 font-medium">{customer.couponStats?.totalUsed || 0} used</span>
          <span className="text-gray-700 font-medium">{customer.couponStats?.totalAllocated || 0} total</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle message action
          }}
          className="flex-1 text-xs text-primary-600 hover:text-primary-800 font-medium py-2 px-3 rounded-lg hover:bg-primary-50 transition-colors duration-200"
        >
          💬 Message
        </button>
        {onAssignCoupon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignCoupon();
            }}
            className="flex-1 text-xs text-secondary-600 hover:text-secondary-800 font-medium py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
          >
            🎁 Assign Coupon
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerRelationshipCard;