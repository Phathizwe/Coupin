import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = '🔍'
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-3xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.2 }}
        whileHover={{
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0],
          backgroundColor: "#fcd34d"
        }}
      >
        {icon}
      </motion.div>

      <motion.h3
        className="text-xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-gray-600 mb-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {message}
      </motion.p>

      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium rounded-lg shadow-md"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            backgroundPosition: ["0%", "100%"]
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            backgroundPosition: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EnhancedEmptyState;