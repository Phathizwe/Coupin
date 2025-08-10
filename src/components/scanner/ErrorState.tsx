import React from 'react';

interface ErrorStateProps {
  error: string;
  onReset: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onReset }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
      <p className="text-gray-600 text-center mb-6">{error}</p>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        TRY AGAIN
      </button>
    </div>
  );
};

export default ErrorState;