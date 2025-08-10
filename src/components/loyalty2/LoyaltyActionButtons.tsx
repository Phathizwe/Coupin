import React from 'react';
import { Link } from 'react-router-dom';
import { LoyaltyProgram } from '../../types';

interface LoyaltyActionButtonsProps {
  program: LoyaltyProgram | null;
  onScanClick: () => void;
  onSendCouponClick: () => void;
  onRewardClick: () => void;
}

/**
 * Component that displays action buttons for the loyalty program in simple mode
 */
const LoyaltyActionButtons: React.FC<LoyaltyActionButtonsProps> = ({
  program,
  onScanClick,
  onSendCouponClick,
  onRewardClick
}) => {
  if (!program) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 animate-slideUp">
      <h2 className="text-lg font-semibold text-purple-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onScanClick}
          className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors"
        >
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-purple-800">Scan QR</span>
        </button>

        <button
          onClick={onSendCouponClick}
          className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-indigo-800">Send Coupon</span>
        </button>

        <button
          onClick={onRewardClick}
          className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-800">Reward</span>
        </button>
      </div>
    </div>
  );
};

export default LoyaltyActionButtons;