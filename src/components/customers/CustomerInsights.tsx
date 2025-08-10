import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';

interface CustomerInsightsProps {
  customers: CustomerWithCouponStats[];
  hasLoyaltyProgram: boolean;
}

const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  customers,
  hasLoyaltyProgram
}) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Growth</h3>
        <p className="text-3xl font-bold text-gray-900">+{customers.length > 0 ? Math.floor(Math.random() * 15) : 0}%</p>
        <p className="text-sm text-gray-500">Compared to last month</p>
        <div className="mt-4 h-16 bg-gray-100 rounded">
          {/* Placeholder for chart */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">Chart placeholder</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coupon Usage</h3>
        <p className="text-3xl font-bold text-gray-900">
          {customers.reduce((sum, c) => sum + (c.couponStats?.totalUsed || 0), 0)}
        </p>
        <p className="text-sm text-gray-500">Total coupons redeemed</p>
        <div className="mt-4 h-16 bg-gray-100 rounded">
          {/* Placeholder for chart */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">Chart placeholder</span>
          </div>
        </div>
      </div>
      
      {hasLoyaltyProgram ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loyalty Program</h3>
          <p className="text-3xl font-bold text-gray-900">
            {customers.filter(c => c.loyaltyPoints && c.loyaltyPoints > 0).length}
          </p>
          <p className="text-sm text-gray-500">Active loyalty members</p>
          <div className="mt-4 h-16 bg-gray-100 rounded">
            {/* Placeholder for chart */}
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-400">Chart placeholder</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Average Spend</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${customers.length > 0 
              ? Math.floor(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length) 
              : 0}
          </p>
          <p className="text-sm text-gray-500">Per customer</p>
          <div className="mt-4 h-16 bg-gray-100 rounded">
            {/* Placeholder for chart */}
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-gray-400">Chart placeholder</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInsights;