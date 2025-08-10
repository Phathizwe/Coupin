import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';

interface EmotionalCustomerInsightsProps {
  customers: CustomerWithCouponStats[];
  hasLoyaltyProgram: boolean;
}

const EmotionalCustomerInsights: React.FC<EmotionalCustomerInsightsProps> = ({
  customers,
  hasLoyaltyProgram
}) => {
  // Calculate insights
  const totalCustomers = customers.length;
  
  // Skip insights if no customers
  if (totalCustomers === 0) {
    return null;
  }
  
  // Calculate coupon usage stats
  const totalCouponsAllocated = customers.reduce((sum, c) => sum + (c.couponStats?.totalAllocated || 0), 0);
  const totalCouponsUsed = customers.reduce((sum, c) => sum + (c.couponStats?.totalUsed || 0), 0);
  const couponUsageRate = totalCouponsAllocated > 0 
    ? Math.round((totalCouponsUsed / totalCouponsAllocated) * 100) 
    : 0;
  
  // Calculate average spend
  const customersWithSpend = customers.filter(c => c.totalSpent && c.totalSpent > 0);
  const averageSpend = customersWithSpend.length > 0
    ? customersWithSpend.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customersWithSpend.length
    : 0;
  
  // Calculate loyalty insights if applicable
  const customersWithLoyalty = hasLoyaltyProgram 
    ? customers.filter(c => c.loyaltyPoints && c.loyaltyPoints > 0)
    : [];
  const loyaltyParticipationRate = hasLoyaltyProgram && totalCustomers > 0
    ? Math.round((customersWithLoyalty.length / totalCustomers) * 100)
    : 0;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Community Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coupon Engagement Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Coupon Engagement</h3>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <p className="text-3xl font-semibold text-blue-600">{couponUsageRate}%</p>
                  <p className="ml-2 text-sm text-gray-500">redemption rate</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {totalCouponsUsed} of {totalCouponsAllocated} coupons used
                </p>
              </div>
              {couponUsageRate < 30 && totalCouponsAllocated > 0 && (
                <div className="mt-3 text-sm text-blue-700">
                  <span className="font-medium">💡 Tip:</span> Send a friendly reminder to boost redemptions
                </div>
              )}
              {couponUsageRate >= 70 && totalCouponsAllocated > 5 && (
                <div className="mt-3 text-sm text-blue-700">
                  <span className="font-medium">🌟 Amazing!</span> Your customers love your offers
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Average Spend Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Average Spend</h3>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <p className="text-3xl font-semibold text-green-600">${averageSpend.toFixed(2)}</p>
                  <p className="ml-2 text-sm text-gray-500">per customer</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {customersWithSpend.length} of {totalCustomers} customers have made purchases
                </p>
              </div>
              {customersWithSpend.length < totalCustomers / 2 && (
                <div className="mt-3 text-sm text-green-700">
                  <span className="font-medium">💡 Tip:</span> Offer a welcome discount to first-time buyers
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loyalty Program Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Loyalty Program</h3>
              {hasLoyaltyProgram ? (
                <div className="mt-2">
                  <div className="flex items-baseline">
                    <p className="text-3xl font-semibold text-purple-600">{loyaltyParticipationRate}%</p>
                    <p className="ml-2 text-sm text-gray-500">participation</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {customersWithLoyalty.length} of {totalCustomers} customers earning points
                  </p>
                  {loyaltyParticipationRate < 50 && (
                    <div className="mt-3 text-sm text-purple-700">
                      <span className="font-medium">💡 Tip:</span> Remind customers about your loyalty program
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">You haven't set up a loyalty program yet</p>
                  <a 
                    href="/business/loyalty" 
                    className="mt-3 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
                  >
                    Create a loyalty program
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalCustomerInsights;