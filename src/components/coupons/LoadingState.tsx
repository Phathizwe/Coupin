import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p className="mt-2 text-gray-500">Loading your coupons...</p>
    </div>
  );
};

export default LoadingState;