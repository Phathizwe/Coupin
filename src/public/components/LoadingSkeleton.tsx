import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 h-[600px]">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;