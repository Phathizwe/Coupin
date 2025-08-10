import React from 'react';

interface AccountTypeSelectorProps {
  accountType: 'customer' | 'business';
  setAccountType: (type: 'customer' | 'business') => void;
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ 
  accountType, 
  setAccountType 
}) => {
  return (
    <div className="mt-4 flex justify-center space-x-4">
      <button
        type="button"
        className={`px-4 py-2 rounded-md transition-colors ${
          accountType === 'customer' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={() => setAccountType('customer')}
        aria-pressed={accountType === 'customer'}
      >
        Customer
      </button>
      <button
        type="button"
        className={`px-4 py-2 rounded-md transition-colors ${
          accountType === 'business' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={() => setAccountType('business')}
        aria-pressed={accountType === 'business'}
      >
        Business
      </button>
    </div>
  );
};

export default AccountTypeSelector;