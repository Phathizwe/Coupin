import React from 'react';

interface EmptyCouponStateProps {
  searchTerm: string;
  filterStatus: string;
  onCreateNew: () => void;
}

const EmptyCouponState: React.FC<EmptyCouponStateProps> = ({ 
  searchTerm, 
  filterStatus, 
  onCreateNew 
}) => {
  return (
    <div className="text-center py-8">
      <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">Start your customer retention strategy</h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || filterStatus !== 'all' 
          ? 'Try adjusting your search or filter criteria.' 
          : 'Create targeted coupons to keep your customers coming back - it\'s 25x cheaper than finding new ones.'}
      </p>
      {!searchTerm && filterStatus === 'all' && (
        <div className="mt-6">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onCreateNew}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Customer Retention Coupon
          </button>
        </div>
      )}
      
      {/* Educational tip */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md text-left max-w-lg mx-auto">
        <h4 className="font-medium text-blue-800 text-sm">Did you know?</h4>
        <p className="text-sm text-blue-700 mt-1">
          Increasing customer retention by just 5% can increase profits by 25-95%. Smart coupon strategies are one of the most effective ways to keep customers coming back.
        </p>
      </div>
    </div>
  );
};

export default EmptyCouponState;