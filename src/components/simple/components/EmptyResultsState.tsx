import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyResultsState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h2 className="text-xl font-medium text-gray-600 mb-2">No Results Yet</h2>
      <p className="text-gray-500 mb-6">Scan a coupon to see redemption results here.</p>
      <button
        onClick={() => navigate('/scan-coupon')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
      >
        SCAN A COUPON
      </button>
    </div>
  );
};

export default EmptyResultsState;