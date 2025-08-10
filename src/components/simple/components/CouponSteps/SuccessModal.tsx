import React from 'react';
import { motion } from 'framer-motion';

interface SuccessModalProps {
  selectedCustomers: string[];
  onReturn: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ selectedCustomers, onReturn }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring" as any, duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.8, 1] }}
          className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your offer has been sent to {selectedCustomers.length} valued customer{selectedCustomers.length !== 1 ? 's' : ''}!
        </p>
        
        <div className="flex justify-center">
          <motion.button
            onClick={onReturn}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessModal;