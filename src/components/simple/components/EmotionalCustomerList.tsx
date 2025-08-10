import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  lastVisit?: string;
  tags?: string[];
}

interface EmotionalCustomerListProps {
  customers: Customer[];
  selectedCustomers: string[];
  onSelect: (customerId: string) => void;
  onAddCustomer: () => void;
}

const EmotionalCustomerList: React.FC<EmotionalCustomerListProps> = ({
  customers,
  selectedCustomers,
  onSelect,
  onAddCustomer
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Select customers</h2>
          <p className="text-gray-600">Choose who will receive this coupon</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {selectedCustomers.length} selected
        </span>
      </div>
      
      {/* Add customer button */}
      <motion.button
        className="w-full py-3 px-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={onAddCustomer}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add New Customer
      </motion.button>
      
      {/* Customer list */}
      <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {customers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCustomers.includes(customer.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelect(customer.id)}
              >
                <div className="flex items-center">
                  {customer.avatar ? (
                    <img 
                      src={customer.avatar} 
                      alt={customer.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      {selectedCustomers.includes(customer.id) && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{customer.email}</p>
                    
                    {customer.lastVisit && (
                      <p className="text-gray-500 text-xs mt-1">
                        Last visit: {customer.lastVisit}
                      </p>
                    )}
                    
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {customer.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {customers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers found. Add your first customer to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalCustomerList;