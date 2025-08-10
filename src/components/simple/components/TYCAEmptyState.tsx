import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_MESSAGES } from '../../../constants/brandConstants';

interface TYCAEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const TYCAEmptyState: React.FC<TYCAEmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Illustration */}
      <motion.div
        className="w-24 h-24 mb-6 rounded-full bg-indigo-100 flex items-center justify-center text-4xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        🎫
      </motion.div>

      {/* Text content */}
      <h2 className="text-xl font-bold mb-2 text-indigo-800">{title}</h2>
      <p className="text-gray-600 mb-8 max-w-sm">{message}</p>

      {/* Action button */}
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-md"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "#4f46e5" // indigo-700
          }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}

      {/* TYCA brand message */}
      <motion.p
        className="text-sm text-gray-500 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {BRAND_MESSAGES.value.standard}
      </motion.p>
    </motion.div>
  );
};

export default TYCAEmptyState;