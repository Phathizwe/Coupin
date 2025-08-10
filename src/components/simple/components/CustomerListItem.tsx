import React from 'react';
import { motion } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email: string;
  visits: number;
  lastVisit: string;
  avatar: string | null;
}

interface CustomerListItemProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: () => void;
}
const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, isSelected, onSelect }) => {
  // Get initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Get relationship strength based on visits
  const getRelationshipLabel = (visits: number) => {
    if (visits >= 15) return { text: 'Loyal Friend', color: 'text-emerald-600' };
    if (visits >= 10) return { text: 'Regular', color: 'text-amber-600' };
    if (visits >= 5) return { text: 'Returning', color: 'text-blue-600' };
    return { text: 'New', color: 'text-purple-600' };
  };
  
  const relationship = getRelationshipLabel(customer.visits);
  
  return (
    <motion.div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-amber-100' : 'hover:bg-amber-50'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
          customer.avatar ? '' : 'bg-gradient-to-br from-amber-500 to-rose-500'
        }`}>
          {customer.avatar ? (
            <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full" />
          ) : (
            getInitials(customer.name)
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <div className="font-medium text-gray-800">{customer.name}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <span className={`mr-2 text-xs font-medium ${relationship.color} bg-white px-1.5 py-0.5 rounded-full`}>
              {relationship.text}
            </span>
            <span>Last visit: {customer.lastVisit}</span>
          </div>
        </div>
        
        <div>
          {isSelected ? (
            <motion.div 
              className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as any, stiffness: 500, damping: 30 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerListItem;