import React from 'react';
import { Customer } from '../../types';

interface CustomerListItemProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string) => void;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ 
  customer, 
  isSelected, 
  onSelect 
}) => {
  return (
    <li className="p-3 flex items-center">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(customer.id)}
        className="h-5 w-5 text-blue-600 mr-3"
      />
      
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
        <span className="text-gray-600 font-medium">
          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {customer.firstName} {customer.lastName}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {customer.phone}
        </p>
      </div>
      
      <div className="text-xs text-gray-500">
        {customer.lastVisit?.toDate 
          ? new Date(customer.lastVisit.toDate()).toLocaleDateString() 
          : 'Never'}
      </div>
    </li>
  );
};

export default CustomerListItem;