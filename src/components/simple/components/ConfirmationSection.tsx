import React from 'react';
import { motion } from 'framer-motion';

interface ConfirmationSectionProps {
  selectedType: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    textColor: string;
    borderColor: string;
  };
  selectedCustomersCount: number;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  selectedType,
  selectedCustomersCount,
  onBack,
  onSubmit,
  isSubmitting
}) => {
  return (
    <motion.div
      key="confirm-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`mx-auto w-24 h-24 rounded-full ${selectedType.color} flex items-center justify-center mb-6`}
      >
        <span className="text-4xl">{selectedType.icon}</span>
      </motion.div>
      
      <h2 className="text-2xl font-bold text-amber-900 mb-2">Ready to share your offer!</h2>
      <p className="text-amber-700 mb-8">
        Your {selectedType.title} offer will be sent to {selectedCustomersCount} valued customer{selectedCustomersCount !== 1 ? 's' : ''}.
      </p>
      
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <h3 className={`text-xl font-bold ${selectedType.textColor} mb-2`}>
          {selectedType.title}
        </h3>
        <p className="text-gray-700 mb-4">{selectedType.description}</p>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>Valid: 30 days</span>
          <span>{selectedCustomersCount} recipient{selectedCustomersCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="px-6 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={onSubmit}
          className="px-8 py-3 rounded-lg text-white shadow-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:shadow-amber-200/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Offer'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ConfirmationSection;