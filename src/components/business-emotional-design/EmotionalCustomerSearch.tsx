import React from 'react';

interface EmotionalCustomerSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  hasLoyaltyProgram: boolean;
  customerCount: number;
}

const EmotionalCustomerSearch: React.FC<EmotionalCustomerSearchProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  hasLoyaltyProgram,
  customerCount
}) => {
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <form onSubmit={handleSubmit} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                placeholder="Find someone in your community..."
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => onSearchTermChange('')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          {!hasLoyaltyProgram && customerCount > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Create a loyalty program to deepen your customer relationships!
                    <a href="/business/loyalty" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                      Get started
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalCustomerSearch;