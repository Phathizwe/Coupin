import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ANIMATIONS } from './animations/DashboardAnimations';
import { CouponTemplateKey } from '../coupons/templates/CouponTemplates';

interface QuickActionsComponentProps {
  onCreateCoupon: (templateKey?: CouponTemplateKey) => void;
}

const QuickActionsComponent: React.FC<QuickActionsComponentProps> = ({ 
  onCreateCoupon 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onCreateCoupon('firstTime')}
          className={`flex flex-col items-center justify-center p-4 bg-primary-50 rounded-lg border border-primary-100 ${ANIMATIONS.transition.fast} hover:bg-primary-100`}
        >
          <div className="p-3 bg-primary-100 rounded-full text-primary-700 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-sm font-medium text-primary-800">New Customer Coupon</span>
        </button>

        <button
          onClick={() => onCreateCoupon('loyalty')}
          className={`flex flex-col items-center justify-center p-4 bg-secondary-50 rounded-lg border border-secondary-100 ${ANIMATIONS.transition.fast} hover:bg-secondary-100`}
        >
          <div className="p-3 bg-secondary-100 rounded-full text-secondary-700 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-secondary-800">Loyalty Reward</span>
        </button>

        <button
          onClick={() => navigate('/business/customers/add')}
          className={`flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100 ${ANIMATIONS.transition.fast} hover:bg-blue-100`}
        >
          <div className="p-3 bg-blue-100 rounded-full text-blue-700 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-800">Add Customer</span>
        </button>

        <button
          onClick={() => onCreateCoupon('buyOneGetOne')}
          className={`flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-100 ${ANIMATIONS.transition.fast} hover:bg-green-100`}
        >
          <div className="p-3 bg-green-100 rounded-full text-green-700 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-800">BOGO Offer</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActionsComponent;