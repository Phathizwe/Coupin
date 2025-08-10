import React from 'react';

interface EmptyStoreStateProps {
  searchQuery: string;
  showOnlyWithCoupons: boolean;
  setShowOnlyWithCoupons: (value: boolean) => void;
}

const EmptyStoreState: React.FC<EmptyStoreStateProps> = ({
  searchQuery,
  showOnlyWithCoupons,
  setShowOnlyWithCoupons
}) => {
  return (
    <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {searchQuery ? (
        <>
          <p className="text-gray-700 font-medium">No stores match your search</p>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </>
      ) : showOnlyWithCoupons ? (
        <>
          <p className="text-gray-700 font-medium">No stores with coupons found</p>
          <p className="text-gray-500 mt-2">
            Try turning off the "Show only stores with coupons" filter to see all saved stores.
          </p>
          <button
            onClick={() => setShowOnlyWithCoupons(false)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Show all stores
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 font-medium">You haven't saved any stores yet</p>
          <p className="text-gray-500 mt-2">
            Explore businesses to find stores you like!
          </p>
        </>
      )}
    </div>
  );
};

export default EmptyStoreState;