import React from 'react';

interface EmptyCouponState2Props {
  searchTerm: string;
  filterStatus: string;
  onCreateNew: () => void;
}

const EmptyCouponState2: React.FC<EmptyCouponState2Props> = ({
  searchTerm,
  filterStatus,
  onCreateNew
}) => {
  // Determine the message based on whether there's a search or filter active
  const hasSearch = !!searchTerm;
  const hasFilter = filterStatus !== 'all';
  
  let title = 'No coupons found';
  let message = 'Get started by creating your first coupon.';
  let showCreateButton = true;
  
  if (hasSearch && hasFilter) {
    title = 'No matching coupons';
    message = `No ${filterStatus} coupons match your search for "${searchTerm}".`;
    showCreateButton = false;
  } else if (hasSearch) {
    title = 'No matching coupons';
    message = `No coupons match your search for "${searchTerm}".`;
    showCreateButton = false;
  } else if (hasFilter) {
    title = `No ${filterStatus} coupons`;
    message = `You don't have any ${filterStatus} coupons at the moment.`;
    showCreateButton = filterStatus !== 'expired';
  }

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
              >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      
      {showCreateButton && (
            <div className="mt-6">
              <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Coupon
          </button>
        </div>
        )}
      </div>
  );
};

export default EmptyCouponState2;