import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Processing...</p>
    </div>
  );
};

export default LoadingState;