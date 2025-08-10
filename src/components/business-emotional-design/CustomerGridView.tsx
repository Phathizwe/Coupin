import React from 'react';
import { CustomerWithCouponStats } from '../../types/customer';
import CustomerRelationshipCard from './CustomerRelationshipCard';

interface CustomerGridViewProps {
  customers: CustomerWithCouponStats[];
  loading: boolean;
  onViewCustomer: (customer: CustomerWithCouponStats) => void;
  onAssignCoupon: (customer: CustomerWithCouponStats) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  onAddFirstCustomer: () => void;
}

const CustomerGridView: React.FC<CustomerGridViewProps> = ({
  customers,
  loading,
  onViewCustomer,
  onAssignCoupon,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onAddFirstCustomer
}) => {
  if (loading && customers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-primary-50 p-8 rounded-xl shadow-sm border border-primary-100 mb-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Building your customer community...</h3>
          <p className="text-gray-700 text-center max-w-md">
            We're gathering all your customer relationships and preparing something beautiful for you.
          </p>
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-700">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Loading your community</span>
          </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-primary-50 to-secondary-50 p-8 rounded-xl shadow-sm border border-primary-100 mb-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-100 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>

        <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 rounded-full mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your customer community is waiting to bloom! 🌱</h3>
          <p className="text-gray-800 mb-2 max-w-lg text-lg">
            Every great business starts with one amazing customer relationship.
          </p>
          <p className="text-gray-700 mb-8 max-w-md">
            Add your first customer and watch your community grow into something beautiful.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onAddFirstCustomer}
              className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Start Building Your Community
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-700">
            <p>💡 Tip: You can also import customers from your contacts or add sample data to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        {/* Community header with growth indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-semibold text-gray-900">Your Growing Community</h2>
            <div className="bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-full">
              <span className="text-green-800 text-sm font-medium">{customers.length} members</span>
            </div>
          </div>
          <div className="text-sm text-gray-700 font-medium">
            Building relationships, one customer at a time ✨
          </div>
        </div>

        {/* Customer grid with staggered animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="transform transition-all duration-300 hover:scale-105 fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <CustomerRelationshipCard
                customer={customer}
                onClick={() => onViewCustomer(customer)}
                onAssignCoupon={() => onAssignCoupon(customer)}
              />
            </div>
          ))}
        </div>

        {/* Load more section with enhanced styling */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="group inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-primary-600">Loading more amazing customers...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Discover More Community Members
                </>
              )}
            </button>
            <p className="text-xs text-gray-700 mt-2 font-medium">
              {isLoadingMore ? 'Finding more wonderful people in your community...' : 'There are more customers to discover!'}
            </p>
          </div>
        )}
      </div>

      {/* Add CSS animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
        `
      }} />
    </>
  );
};

export default CustomerGridView;