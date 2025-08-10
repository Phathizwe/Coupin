import React, { useMemo } from 'react';
import { Coupon } from '../../types';

interface CouponStats2Props {
  coupons: Coupon[];
  isMobileView?: boolean;
}

const CouponStats2: React.FC<CouponStats2Props> = ({ coupons, isMobileView = false }) => {
  // Calculate stats from coupons
  const stats = useMemo(() => {
  const now = new Date();
  
    const active = coupons.filter(coupon => 
      coupon.active && 
      now >= new Date(coupon.startDate) && 
      now <= new Date(coupon.endDate)
    ).length;
  
    const scheduled = coupons.filter(coupon => 
      coupon.active && 
      now < new Date(coupon.startDate)
    ).length;
  
    const expired = coupons.filter(coupon => 
      now > new Date(coupon.endDate)
    ).length;
  
    const totalRedemptions = coupons.reduce((sum, coupon) => 
      sum + (coupon.usageCount || 0), 0
    );
    
    return { active, scheduled, expired, totalRedemptions };
  }, [coupons]);

  return (
    <div className={`bg-white rounded-lg shadow mb-6 ${isMobileView ? 'p-4' : 'p-6'}`}>
      <h2 className={`${isMobileView ? 'text-lg' : 'text-xl'} font-semibold mb-4`}>
        Coupon Statistics
      </h2>
      
      <div className={`grid ${isMobileView ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-6'}`}>
        {/* Active Coupons */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-800">{stats.active}</p>
        </div>
            <div className="bg-green-200 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
    </div>
          </div>
        </div>

        {/* Scheduled Coupons */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-blue-800">{stats.scheduled}</p>
            </div>
            <div className="bg-blue-200 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expired Coupons */}
        <div className={`bg-gray-50 rounded-lg p-4 ${isMobileView ? 'col-span-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Expired</p>
              <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
            </div>
            <div className="bg-gray-200 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Redemptions */}
        <div className={`bg-purple-50 rounded-lg p-4 ${isMobileView ? 'col-span-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Redemptions</p>
              <p className="text-2xl font-bold text-purple-800">{stats.totalRedemptions}</p>
            </div>
            <div className="bg-purple-200 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponStats2;