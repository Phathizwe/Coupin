import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Processing...' }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;