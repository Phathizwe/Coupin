import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SuccessCelebrationProps {
  recipientCount: number;
  onClose: () => void;
}

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  recipientCount,
  onClose
}) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-sm mx-auto text-center relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring" as any, duration: 0.5 }}
      >
        {/* Background decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-100 rounded-full opacity-50"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-100 rounded-full opacity-50"></div>
        
        {/* Custom confetti animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                ['bg-amber-400', 'bg-rose-400', 'bg-emerald-400', 'bg-purple-400', 'bg-blue-400'][i % 5]
              }`}
              initial={{ 
                top: "0%",
                left: `${Math.random() * 100}%`,
                opacity: 1,
                scale: 1
              }}
              animate={{ 
                top: "100%",
                left: `${Math.random() * 100}%`,
                opacity: [1, 1, 0],
                scale: [1, 1, 0.5],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, times: [0, 0.8, 1] }}
            className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-300 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg"
          >
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Success!
          </motion.h3>
          
          <motion.p 
            className="text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your offer has been sent to {recipientCount} valued customer{recipientCount !== 1 ? 's' : ''}!
          </motion.p>
          
          {/* Stats */}
          <motion.div 
            className="bg-gray-50 rounded-xl p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-xs text-gray-500">Sent to</p>
                <p className="text-lg font-bold text-amber-600">{recipientCount} customers</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Estimated reach</p>
                <p className="text-lg font-bold text-amber-600">{recipientCount * 1.5}+ people</p>
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-center">
            <motion.button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-lg shadow-md font-medium"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Return to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuccessCelebration;