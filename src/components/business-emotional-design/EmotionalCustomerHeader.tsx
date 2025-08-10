import React from 'react';

interface EmotionalCustomerHeaderProps {
  customerCount: number;
  onAddCustomer: () => void;
  onAddSampleData: () => void;
  loading?: boolean; // Add this optional prop
}

const EmotionalCustomerHeader: React.FC<EmotionalCustomerHeaderProps> = ({
  customerCount,
  onAddCustomer,
  onAddSampleData,
  loading = false // Default to false
}) => {
  // Determine the appropriate message based on customer count
  const getWelcomeMessage = () => {
    if (customerCount === 0) {
      return "Welcome to Your Customer Community!";
    } else if (customerCount < 5) {
      return "Your Customer Community is Growing!";
    } else if (customerCount < 20) {
      return "You're Building a Wonderful Community!";
    } else if (customerCount < 50) {
      return "Your Customer Community is Thriving!";
    } else {
      return "You Have an Amazing Customer Community!";
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
          <p className="mt-2 opacity-90">
            {customerCount === 0 
              ? "Start building relationships by adding your first customer."
              : `You're connecting with ${customerCount} ${customerCount === 1 ? 'person' : 'people'}.`
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onAddCustomer}
            className="bg-white text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-md font-medium shadow-sm transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Add Customer
          </button>
          {customerCount === 0 && (
            <button
              onClick={onAddSampleData}
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Add Sample Data
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalCustomerHeader;