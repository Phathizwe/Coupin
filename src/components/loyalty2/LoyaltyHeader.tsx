import React from 'react';

interface LoyaltyHeaderProps {
  hasProgram: boolean;
  onCreateClick: () => void;
}

const LoyaltyHeader: React.FC<LoyaltyHeaderProps> = ({ hasProgram, onCreateClick }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <div className="mb-4 md:mb-0">
        <h1 className="text-3xl font-bold text-purple-900 flex items-center">
          Loyalty Program 2.0
          <span className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full">
            NEW
          </span>
        </h1>
        <p className="text-gray-600 mt-1">
          {hasProgram 
            ? "Manage your loyalty program and reward your best customers" 
            : "Create a loyalty program to turn one-time buyers into lifelong fans"}
        </p>
      </div>
      
      <button
        onClick={onCreateClick}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md flex items-center justify-center group"
      >
        <span className="mr-2">
          {hasProgram ? "Edit Program" : "Create Program"}
        </span>
        <svg 
          className="w-5 h-5 transform group-hover:rotate-45 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};

export default LoyaltyHeader;