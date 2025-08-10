import React, { useState, useEffect } from 'react';

interface CustomerGrowthCelebrationProps {
  isVisible: boolean;
  newCustomerCount: number;
  onDismiss: () => void;
}

const CustomerGrowthCelebration: React.FC<CustomerGrowthCelebrationProps> = ({
  isVisible,
  newCustomerCount,
  onDismiss
}) => {
  const [animation, setAnimation] = useState('');

  useEffect(() => {
    if (isVisible) {
      setAnimation('animate-celebration');
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className={`bg-white rounded-lg shadow-xl p-8 max-w-md ${animation}`}>
        <div className="text-center">
          <div className="inline-block p-4 bg-primary-100 rounded-full mb-4">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Amazing Growth!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {newCustomerCount === 1 
              ? "You've added a new customer to your community!" 
              : `You've added ${newCustomerCount} new customers to your community!`}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onDismiss}
              className="px-6 py-3 bg-primary-600 text-white rounded-md shadow-md hover:bg-primary-700 transition-colors"
            >
              Continue Building My Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerGrowthCelebration;