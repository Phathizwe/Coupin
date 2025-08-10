import React from 'react';

interface StatsSectionProps {
  todayCoupons: number;
  weeklyReturns: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({ todayCoupons, weeklyReturns }) => {
  return (
    <div className="flex justify-between p-4 bg-gray-50 border-b">
      <div className="text-center flex-1">
        <p className="text-2xl font-bold">{todayCoupons}</p>
        <p className="text-sm text-gray-600">Today: coupons used</p>
      </div>
      <div className="text-center flex-1">
        <p className="text-2xl font-bold">{weeklyReturns}</p>
        <p className="text-sm text-gray-600">This week: customers returned</p>
      </div>
    </div>
  );
};

export default StatsSection;