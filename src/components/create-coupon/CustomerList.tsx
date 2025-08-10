import React from 'react';
import { Customer } from '../../types';
import CustomerListItem from './CustomerListItem';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  isLoading: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  selectedCustomers, 
  onSelectCustomer,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No customers found
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {customers.map(customer => (
        <CustomerListItem 
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomers.includes(customer.id)}
          onSelect={onSelectCustomer}
        />
      ))}
    </ul>
  );
};

export default CustomerList;