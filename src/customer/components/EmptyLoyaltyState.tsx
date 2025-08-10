import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyLoyaltyStateProps {
  searchQuery?: string;
}

const EmptyLoyaltyState: React.FC<EmptyLoyaltyStateProps> = ({ searchQuery = '' }) => {
  // If there's a search query, show a "no results" message
  if (searchQuery) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <svg className="w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No matching loyalty programs</h3>
        <p className="text-gray-500 mb-4">
          We couldn't find any loyalty programs matching "{searchQuery}".
        </p>
        <button
          onClick={() => window.location.href = '/customer/loyalty'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear Search
        </button>
      </div>
    );
  }

  // Default empty state
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
        <svg className="w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Loyalty Programs Yet</h3>
      <p className="text-gray-500 mb-4">
        You haven't joined any loyalty programs yet. Visit stores to start earning rewards!
      </p>
      <Link
        to="/customer/stores"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Browse Stores
      </Link>
    </div>
  );
};

export default EmptyLoyaltyState;