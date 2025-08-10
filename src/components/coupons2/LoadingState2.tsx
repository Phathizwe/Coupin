import React from 'react';

const LoadingState2: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="animate-pulse space-y-6">
        {/* Loading header */}
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        
        {/* Loading table header */}
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
          <div className="h-4 bg-gray-200 rounded col-span-1"></div>
        </div>
        
        {/* Loading rows */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4">
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
            <div className="h-10 bg-gray-200 rounded col-span-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState2;