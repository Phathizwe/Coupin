import React from 'react';

interface Pagination2Props {
  onLoadMore: () => void;
  loading: boolean;
}

const Pagination2: React.FC<Pagination2Props> = ({ onLoadMore, loading }) => {
  return (
    <div className="flex justify-center my-8">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className={`
          inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium
          ${loading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            Load More
            <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

export default Pagination2;