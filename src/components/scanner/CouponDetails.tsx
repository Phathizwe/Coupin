import React from 'react';
import { Coupon, Customer } from '../../types';

interface CouponDetailsProps {
  coupon: Coupon;
  customer: Customer;
  isLoading: boolean;
  onRedeem: () => void;
}

const CouponDetails: React.FC<CouponDetailsProps> = ({ coupon, customer, isLoading, onRedeem }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-6">{coupon.title}</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">CUSTOMER</h3>
          <p className="text-lg font-medium">{customer.firstName} {customer.lastName}</p>
          <p className="text-gray-600">{customer.phone}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">COUPON DETAILS</h3>
          <p className="text-gray-800 mb-1">{coupon.description}</p>
          <p className="text-sm text-gray-600">
            Valid until: {coupon.endDate?.toDate 
              ? new Date(coupon.endDate.toDate()).toLocaleDateString() 
              : new Date(coupon.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <button
        onClick={onRedeem}
        disabled={isLoading}
        className="w-full py-4 bg-green-600 text-white text-xl font-bold rounded-lg"
      >
        {isLoading ? 'PROCESSING...' : 'APPLY DISCOUNT'}
      </button>
    </div>
  );
};

export default CouponDetails;