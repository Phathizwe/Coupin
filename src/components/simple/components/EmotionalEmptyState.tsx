import React from 'react';
import { motion } from 'framer-motion';

interface EmotionalEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

const EmotionalEmptyState: React.FC<EmotionalEmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = '🎫'
}) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center p-8 h-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 shadow-md"
        variants={itemVariants}
      >
        <span className="text-4xl">{icon}</span>
      </motion.div>
      
      <motion.h3 
        className="text-xl font-bold text-gray-800 mb-2"
        variants={itemVariants}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 mb-8 max-w-sm"
        variants={itemVariants}
      >
        {message}
      </motion.p>
      
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-md font-medium"
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-amber-200 opacity-40"
        animate={{
          y: [0, -15, 0],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-1/3 w-6 h-6 rounded-full bg-amber-300 opacity-30"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.div>
  );
};

export default EmotionalEmptyState;