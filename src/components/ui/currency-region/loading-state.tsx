import React from 'react';

export function LoadingState() {
  return (
    <div className="w-full max-w-md mx-auto p-4 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4 items-center">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}