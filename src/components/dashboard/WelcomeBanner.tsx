import React from 'react';
import { BRAND, BRAND_MESSAGES } from '../../constants/brandConstants';
import { useAuth } from '../../hooks/useAuth';

interface WelcomeBannerProps {
  className?: string;
  businessName?: string;
  hasCoupons?: boolean;
  hasCustomers?: boolean;
  onCreateCoupon?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  className = '',
  businessName,
  hasCoupons = false,
  hasCustomers = false,
  onCreateCoupon
}) => {
  const { user } = useAuth();
  const userName = user?.displayName || 'there';
  const displayName = businessName || userName;
  
  // Get appropriate greeting based on time of day
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return BRAND_MESSAGES.dashboard.morning;
    if (hour < 18) return BRAND_MESSAGES.dashboard.afternoon;
    return BRAND_MESSAGES.dashboard.evening;
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary-700 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {displayName}!</h1>
          <p className="text-gray-600 mt-1">{getTimeBasedGreeting()}</p>
        </div>
        
        <div className="hidden md:block">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-light text-primary-800">
            {BRAND.tagline}
          </span>
        </div>
        
        {!hasCoupons && onCreateCoupon && (
          <div className="w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={onCreateCoupon}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Coupon
            </button>
    </div>
        )}
        
        {!hasCustomers && hasCoupons && (
          <div className="w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={() => window.location.href = '/business/customers'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Your Customers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeBanner;