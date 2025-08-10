import React from 'react';
import { Coupon, Customer } from '../../../types';
import MoreOptionsButton from './MoreOptionsButton';

interface CouponDetailsProps {
  coupon: Coupon;
  customer: Customer;
  isLoading: boolean;
  onRedeem: () => void;
}

const CouponDetails: React.FC<CouponDetailsProps> = ({ 
  coupon, 
  customer, 
  isLoading, 
  onRedeem 
}) => {
  return (
    <>
      <div className="flex-1">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-8">{coupon.title}</h2>
        
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">CUSTOMER</h3>
          <p className="text-xl font-medium">{customer.firstName} {customer.lastName}</p>
          <p className="text-lg text-gray-600">{customer.phone}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2">COUPON DETAILS</h3>
          <p className="text-lg text-gray-800 mb-2">{coupon.description}</p>
          <p className="text-gray-600">
            Valid until: {coupon.endDate?.toDate 
              ? new Date(coupon.endDate.toDate()).toLocaleDateString() 
              : new Date(coupon.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div>
        <button
          onClick={onRedeem}
          disabled={isLoading}
          className="w-full py-5 bg-green-600 text-white text-xl font-bold rounded-lg"
        >
          {isLoading ? 'PROCESSING...' : 'APPLY DISCOUNT'}
        </button>
        
        {/* More options button */}
        <MoreOptionsButton />
      </div>
    </>
  );
};

export default CouponDetails;