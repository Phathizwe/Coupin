import React, { useState } from 'react';
import { Customer } from '../../types';
import { CustomerWithCouponStats } from '../../types/customer';
import CustomerLoyaltyCard from './CustomerLoyaltyCard';
// Other imports

interface CustomerDetailViewProps {
  customer: CustomerWithCouponStats;
  onCustomerUpdated: (customer: Customer) => void;
  onClose: () => void;
  hasLoyaltyProgram: boolean;
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  onCustomerUpdated,
  onClose,
  hasLoyaltyProgram
}) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
      {/* Customer header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              Customer since {new Date(customer.joinDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            {hasLoyaltyProgram && (
              <button
                className={`${activeTab === 'loyalty'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('loyalty')}
              >
                Loyalty
              </button>
            )}
            <button
              className={`${activeTab === 'coupons'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('coupons')}
            >
              Coupons
            </button>
            <button
              className={`${activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div>
            {/* Customer details content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-1">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="mt-1">{customer.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="mt-1">
                      {customer.birthdate
                        ? new Date(customer.birthdate).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="mt-1 text-xl font-semibold">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Visits</p>
                    <p className="mt-1">{customer.totalVisits || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="mt-1">
                      {customer.lastVisit
                        ? new Date(customer.lastVisit).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and tags */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes & Tags</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm border rounded-md p-3 bg-gray-50">
                    {customer.notes || 'No notes available for this customer.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && hasLoyaltyProgram && (
          <CustomerLoyaltyCard
            customer={customer}
            onPointsUpdated={onCustomerUpdated}
          />
        )}

        {activeTab === 'coupons' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Coupons</h3>
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Allocated</p>
                    <p className="text-xl font-semibold text-gray-900">{customer.couponStats?.totalAllocated || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Used</p>
                    <p className="text-xl font-semibold text-green-600">{customer.couponStats?.totalUsed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unused</p>
                    <p className="text-xl font-semibold text-blue-600">{customer.couponStats?.unusedCoupons || 0}</p>
                  </div>
                </div>
              </div>

              {(customer.couponStats?.unusedCoupons || 0) > 0 ? (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Available Coupons</h4>
                  <p className="text-sm text-gray-500">
                    This customer has {customer.couponStats?.unusedCoupons} unused coupons.
                  </p>
                  {/* You could add a button to view detailed coupon information */}
                </div>
              ) : (
                <p className="text-sm text-gray-500">This customer has no unused coupons.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {/* History content */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
            {/* Transaction history would go here */}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailView;