import React from 'react';
import MoreOptionsButton from './MoreOptionsButton';

interface ScanErrorStateProps {
  errorMessage: string;
  onReset: () => void;
}

const ScanErrorState: React.FC<ScanErrorStateProps> = ({ errorMessage, onReset }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Error</h2>
      <p className="text-lg text-gray-600 text-center mb-8">{errorMessage}</p>
      <button
        onClick={onReset}
        className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg"
      >
        TRY AGAIN
      </button>
      
      {/* More options button */}
      <MoreOptionsButton />
    </div>
  );
};

export default ScanErrorState;