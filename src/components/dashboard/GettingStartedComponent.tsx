import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, BRAND_MESSAGES } from '../../constants/brandConstants';

interface GettingStartedComponentProps {
  businessId: string;
  hasCreatedCoupons: boolean;
  hasCompletedProfile: boolean;
  hasSharedCoupons: boolean;
}
const GettingStartedComponent: React.FC<GettingStartedComponentProps> = ({
  businessId,
  hasCreatedCoupons,
  hasCompletedProfile,
  hasSharedCoupons
}) => {
  return (
      <div className="space-y-4">
      <h3 className="font-medium text-primary-800">Getting Started with {BRAND.name}</h3>
            <Link 
              to="/business/coupons" 
        className="flex items-center p-3 bg-white rounded-md shadow-sm hover:bg-primary-50 transition-colors"
            >
        <div className="p-2 bg-primary-100 rounded-full text-primary-700 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          </div>
        <div>
          <p className="text-sm font-medium text-gray-800">Create your first coupon</p>
          <p className="text-xs text-gray-500">{BRAND_MESSAGES.success.couponCreated}</p>
        </div>
            </Link>
            <Link 
        to="/business/customers" 
        className="flex items-center p-3 bg-white rounded-md shadow-sm hover:bg-primary-50 transition-colors"
            >
        <div className="p-2 bg-primary-100 rounded-full text-primary-700 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          </div>
        <div>
          <p className="text-sm font-medium text-gray-800">Add your customers</p>
          <p className="text-xs text-gray-500">{BRAND_MESSAGES.success.customerAdded}</p>
      </div>
      </Link>
      
      <Link 
        to="/business/settings" 
        className="flex items-center p-3 bg-white rounded-md shadow-sm hover:bg-primary-50 transition-colors"
      >
        <div className="p-2 bg-primary-100 rounded-full text-primary-700 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">Complete your profile</p>
          <p className="text-xs text-gray-500">{BRAND_MESSAGES.success.settingsUpdated}</p>
        </div>
      </Link>
    </div>
  );
};

export default GettingStartedComponent;