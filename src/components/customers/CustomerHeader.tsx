import React from 'react';

interface CustomerHeaderProps {
  onAddCustomer: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  onAddCustomer
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      <div>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 font-medium"
          onClick={onAddCustomer}
        >
          Add Customer
        </button>
      </div>
    </div>
  );
};

export default CustomerHeader;