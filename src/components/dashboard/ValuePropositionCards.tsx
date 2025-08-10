import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ANIMATIONS } from './animations/DashboardAnimations';
import { BRAND_MESSAGES } from '../../constants/brandConstants';

const ValuePropositionCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className={`bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 shadow-sm border border-primary-100 ${ANIMATIONS.transition.medium} ${ANIMATIONS.hover.scale}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-800">Loyal Customers</h3>
          <div className="p-2 bg-white rounded-full text-primary-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <p className="text-primary-700 mb-4">{BRAND_MESSAGES.customer.loyalty}</p>
        <button
          onClick={() => navigate('/business/customers')}
          className="w-full bg-white text-primary-700 border border-primary-200 rounded-lg px-4 py-2 font-medium hover:bg-primary-50 transition-colors"
        >
          View Customers
        </button>
      </div>

      <div className={`bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-6 shadow-sm border border-secondary-100 ${ANIMATIONS.transition.medium} ${ANIMATIONS.hover.scale}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-800">Coupon Performance</h3>
          <div className="p-2 bg-white rounded-full text-secondary-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        </div>
        <p className="text-secondary-700 mb-4">{BRAND_MESSAGES.success.couponCreated}</p>
        <button
          onClick={() => navigate('/business/coupons')}
          className="w-full bg-white text-secondary-700 border border-secondary-200 rounded-lg px-4 py-2 font-medium hover:bg-secondary-50 transition-colors"
        >
          View Coupons
        </button>
      </div>

      <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-100 ${ANIMATIONS.transition.medium} ${ANIMATIONS.hover.scale}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800">Business Insights</h3>
          <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-blue-700 mb-4">{BRAND_MESSAGES.value.growth}</p>
        <button
          onClick={() => navigate('/business/analytics')}
          className="w-full bg-white text-blue-700 border border-blue-200 rounded-lg px-4 py-2 font-medium hover:bg-blue-50 transition-colors"
        >
          View Analytics
        </button>
      </div>
    </div>
  );
};

export default ValuePropositionCards;