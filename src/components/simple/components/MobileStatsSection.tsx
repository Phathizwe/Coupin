import React from 'react';

interface MobileStatsSectionProps {
  activeCoupons: number;
  totalRedemptions: number;
  loyalCustomers: number;
}

const MobileStatsSection: React.FC<MobileStatsSectionProps> = ({ 
  activeCoupons, 
  totalRedemptions, 
  loyalCustomers 
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-white/80">Active Coupons</p>
          <h3 className="text-xl font-bold text-white">{activeCoupons}</h3>
        </div>
      </div>
      
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-white/80">Redemptions</p>
          <h3 className="text-xl font-bold text-white">{totalRedemptions}</h3>
        </div>
      </div>
      
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-white/80">Loyal Customers</p>
          <h3 className="text-xl font-bold text-white">{loyalCustomers}</h3>
        </div>
      </div>
    </div>
  );
};

export default MobileStatsSection;