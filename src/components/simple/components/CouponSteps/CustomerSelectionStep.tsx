import React from 'react';
import { motion } from 'framer-motion';
import CustomerList from '../CustomerList';

interface CustomerSelectionStepProps {
  selectedCustomers: string[];
  onCustomerSelect: (customerId: string) => void;
  onAddNew: () => void;
  onBack: () => void;
  onNext: () => void;
  selectedTypeDetails: {
    title: string;
    description: string;
    color: string;
    textColor: string;
    icon: string;
  } | null;
}

const CustomerSelectionStep: React.FC<CustomerSelectionStepProps> = ({
  selectedCustomers,
  onCustomerSelect,
  onAddNew,
  onBack,
  onNext,
  selectedTypeDetails,
}) => {
  return (
    <motion.div
      key="customers-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold text-amber-900 mb-2">Choose your valued customers</h2>
      <p className="text-amber-700 mb-6">
        Select who will receive your {selectedTypeDetails?.title} offer.
      </p>
      
      <CustomerList 
        onSelect={onCustomerSelect} 
        selectedIds={selectedCustomers}
        onAddNew={onAddNew}
      />
      
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="px-6 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={onNext}
          className={`px-6 py-2 rounded-lg text-white shadow-lg ${
            selectedCustomers.length > 0 
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:shadow-amber-200/50' 
              : 'bg-gray-400'
          }`}
          whileHover={selectedCustomers.length > 0 ? { scale: 1.05 } : {}}
          whileTap={selectedCustomers.length > 0 ? { scale: 0.95 } : {}}
          disabled={selectedCustomers.length === 0}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CustomerSelectionStep;