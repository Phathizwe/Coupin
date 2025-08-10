import React from 'react';
import { LoyaltyProgram } from '../../types';

interface DetailedLoyaltyActionsProps {
  program: LoyaltyProgram | null;
  onScanClick: () => void;
  onSendCouponClick: () => void;
  onRewardClick: () => void;
}

/**
 * Component for displaying action buttons in the detailed loyalty view
 * Desktop-oriented with more detailed information
 */
const DetailedLoyaltyActions: React.FC<DetailedLoyaltyActionsProps> = ({
  program,
  onScanClick,
  onSendCouponClick,
  onRewardClick
}) => {
  if (!program) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div 
          onClick={onScanClick}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-purple-900">Scan QR</h3>
              <p className="text-xs text-purple-700">Record customer visit</p>
            </div>
          </div>
          <p className="text-sm text-purple-800">
            {program.type === 'visits' ? 
              `Record visits (${program.visitsRequired} visits = 1 reward)` : 
              program.type === 'points' ? 
                `Add points (1 visit = 1 point)` : 
                `Add points and track tier progress`}
          </p>
          <button className="mt-3 w-full py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
            Scan Now
          </button>
        </div>

        <div 
          onClick={onSendCouponClick}
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-indigo-900">Send Coupon</h3>
              <p className="text-xs text-indigo-700">Distribute special offers</p>
            </div>
          </div>
          <p className="text-sm text-indigo-800">
            Send personalized coupons to your loyal customers to encourage repeat business
          </p>
          <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            Send Coupon
          </button>
        </div>

        <div 
          onClick={onRewardClick}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-blue-900">Reward</h3>
              <p className="text-xs text-blue-700">Redeem customer rewards</p>
            </div>
          </div>
          <p className="text-sm text-blue-800">
            Process rewards for customers who have earned them through loyalty program participation
          </p>
          <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Process Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedLoyaltyActions;