import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';

interface CustomerTableProps {
  customers: CustomerWithCouponStats[];
  loading: boolean;
  hasLoyaltyProgram: boolean;
  onViewCustomer: (customer: CustomerWithCouponStats) => void;
  onAssignCoupon: (customer: CustomerWithCouponStats) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  onAddFirstCustomer: () => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  hasLoyaltyProgram,
  onViewCustomer,
  onAssignCoupon,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onAddFirstCustomer
}) => {
  if (loading && customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (!loading && customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="text-center py-6">
          <p className="text-gray-500">No customers found matching your search.</p>
          <button 
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            onClick={onAddFirstCustomer}
          >
            Add Your First Customer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              {hasLoyaltyProgram && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Points
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coupons
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewCustomer(customer)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-800 font-medium">{customer.firstName.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.totalVisits || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${customer.totalSpent || 0}</div>
                </td>
                {hasLoyaltyProgram && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-600">
                      {customer.loyaltyPoints || 0} points
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{customer.couponStats?.totalAllocated || 0}</span> allocated
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-green-600">{customer.couponStats?.totalUsed || 0}</span> used, 
                      <span className="text-blue-600 ml-1">{customer.couponStats?.unusedCoupons || 0}</span> unused
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-primary-600 hover:text-primary-900 mr-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewCustomer(customer);
                    }}
                  >
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 mr-3">Message</button>
                  <button 
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignCoupon(customer);
                    }}
                  >
                    Assign Coupon
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{customers.length}</span> customers
          </div>
          <div className="flex-1 flex justify-end">
            {isLoadingMore && (
              <span className="text-sm text-gray-500 mr-3">Loading...</span>
            )}
            <button 
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              onClick={onLoadMore}
              disabled={isLoadingMore || !hasMore}
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTable;