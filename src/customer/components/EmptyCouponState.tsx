import React from 'react';

export interface EmptyCouponStateProps {
  searchQuery?: string;
}

const EmptyCouponState: React.FC<EmptyCouponStateProps> = ({ searchQuery = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <img 
        src="/images/empty-coupon.svg" 
        alt="No coupons found" 
        className="w-40 h-40 mb-4 opacity-60"
        onError={(e) => {
          e.currentTarget.src = '/assets/placeholder-coupon.png';
        }}
      />
      
      {searchQuery ? (
        <>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No coupons match your search</h3>
          <p className="text-gray-500 text-center">
            We couldn't find any coupons matching "{searchQuery}". Try a different search term.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No coupons yet</h3>
          <p className="text-gray-500 text-center">
            You don't have any coupons at the moment. Check back later for special offers!
          </p>
        </>
      )}
    </div>
  );
};

export default EmptyCouponState;