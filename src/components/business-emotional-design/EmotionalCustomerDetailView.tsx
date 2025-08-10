import React, { useState } from 'react';
import { Customer } from '../../types';
import { CustomerWithCouponStats } from '../../types/customer';

interface EmotionalCustomerDetailViewProps {
  customer: CustomerWithCouponStats;
  onCustomerUpdated: (customer: Customer) => void;
  onClose: () => void;
  hasLoyaltyProgram: boolean;
  onAssignCoupon: (customer: CustomerWithCouponStats) => void;
}

const EmotionalCustomerDetailView: React.FC<EmotionalCustomerDetailViewProps> = ({
  customer,
  onCustomerUpdated,
  onClose,
  hasLoyaltyProgram,
  onAssignCoupon
}) => {
  const [activeTab, setActiveTab] = useState('relationship');

  // Calculate days since join
  const daysSinceJoin = Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 3600 * 24));

  // Calculate relationship strength (simple algorithm)
  const calculateRelationshipStrength = (): number => {
    const visits = customer.totalVisits || 0;
    const spent = customer.totalSpent || 0;
    const couponsUsed = customer.couponStats?.totalUsed || 0;

    const visitScore = Math.min(visits / 10, 1);
    const spendScore = Math.min(spent / 1000, 1);
    const couponScore = Math.min(couponsUsed / 5, 1);

    return (visitScore + spendScore + couponScore) / 3;
  };

  const relationshipStrength = calculateRelationshipStrength();

  // Get relationship status
  const getRelationshipStatus = (): string => {
    if (relationshipStrength > 0.8) return 'Loyal Champion';
    if (relationshipStrength > 0.6) return 'Regular Customer';
    if (relationshipStrength > 0.3) return 'Growing Relationship';
    if (relationshipStrength > 0) return 'New Connection';
    return 'New Customer';
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
      {/* Customer header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary-700 font-bold text-xl mr-4">
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </h2>
              <div className="flex items-center">
                <span className="text-primary-100">
                  {getRelationshipStatus()}
                </span>
                <span className="mx-2">•</span>
                <span className="text-primary-100">
                  {daysSinceJoin} days in your community
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-primary-100 text-sm">Total Spent</p>
            <p className="text-2xl font-bold">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-primary-100 text-sm">Visits</p>
            <p className="text-2xl font-bold">{customer.totalVisits || 0}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-primary-100 text-sm">Coupons Used</p>
            <p className="text-2xl font-bold">{customer.couponStats?.totalUsed || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-primary-500">
          <nav className="flex space-x-6">
            <button
              className={`${activeTab === 'relationship'
                ? 'border-white text-white'
                : 'border-transparent text-primary-200 hover:text-white'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('relationship')}
            >
              Relationship
            </button>
            <button
              className={`${activeTab === 'details'
                ? 'border-white text-white'
                : 'border-transparent text-primary-200 hover:text-white'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            {hasLoyaltyProgram && (
              <button
                className={`${activeTab === 'loyalty'
                  ? 'border-white text-white'
                  : 'border-transparent text-primary-200 hover:text-white'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('loyalty')}
              >
                Loyalty
              </button>
            )}
            <button
              className={`${activeTab === 'coupons'
                ? 'border-white text-white'
                : 'border-transparent text-primary-200 hover:text-white'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('coupons')}
            >
              Coupons
            </button>
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'relationship' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Relationship Strength</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Relationship Score</span>
                  <span className="text-sm font-medium">{Math.round(relationshipStrength * 100)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${relationshipStrength * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Visits</p>
                    <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(((customer.totalVisits || 0) / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spending</p>
                    <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(((customer.totalSpent || 0) / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Engagement</p>
                    <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(((customer.couponStats?.totalUsed || 0) / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Journey</h3>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>
                <ul className="space-y-4 relative">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white z-10">
                      1
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Joined your community</p>
                      <p className="text-sm text-gray-500">{new Date(customer.joinDate).toLocaleDateString()}</p>
                    </div>
                  </li>
                  {(customer.totalVisits || 0) > 0 && (
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white z-10">
                        2
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">First visit to your business</p>
                        <p className="text-sm text-gray-500">
                          {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Date not recorded'}
                        </p>
                      </div>
                    </li>
                  )}
                  {(customer.couponStats?.totalAllocated || 0) > 0 && (
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white z-10">
                        {(customer.totalVisits || 0) > 0 ? 3 : 2}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">Received first coupon</p>
                        <p className="text-sm text-gray-500">Date not recorded</p>
                      </div>
                    </li>
                  )}
                  {(customer.couponStats?.totalUsed || 0) > 0 && (
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-white z-10">
                        {((customer.totalVisits || 0) > 0 ? 1 : 0) + ((customer.couponStats?.totalAllocated || 0) > 0 ? 1 : 0) + 2}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">Redeemed first coupon</p>
                        <p className="text-sm text-gray-500">Date not recorded</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Relationship Growth Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="flex items-center p-4 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={() => onAssignCoupon(customer)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                    🎁
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Send a Special Offer</p>
                    <p className="text-sm text-gray-500">Reward loyalty with a personalized coupon</p>
                  </div>
                </button>
                <button className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    💬
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Send a Message</p>
                    <p className="text-sm text-gray-500">Reach out with a personal communication</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{customer.phone || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="font-medium">
                      {customer.birthdate
                        ? new Date(customer.birthdate).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags & Notes</h3>
                <div className="space-y-4">
                  {/* Fixed the unterminated string here */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Customer Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.tags && customer.tags.length > 0 ? (
                        customer.tags.map((tag, index) => (
                          <span key={index} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No tags added yet</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm mt-1">
                      {customer.notes || 'No notes added yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalCustomerDetailView;