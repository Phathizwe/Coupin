import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MascotMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'helping';

interface CouponMascotProps {
  mood: MascotMood;
  message?: string;
  showMessage?: boolean;
  onMessageClose?: () => void;
}

const CouponMascot: React.FC<CouponMascotProps> = ({ 
  mood, 
  message, 
  showMessage = true,
  onMessageClose 
}) => {
  // Mascot expressions based on mood
  const getMascotEmoji = () => {
    switch (mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'thinking': return '🤔';
      case 'celebrating': return '🎉';
      case 'helping': return '💡';
      default: return '😊';
    }
  };
  
  // Background colors based on mood
  const getMascotBackground = () => {
    switch (mood) {
      case 'happy': return 'bg-amber-100';
      case 'excited': return 'bg-rose-100';
      case 'thinking': return 'bg-blue-100';
      case 'celebrating': return 'bg-purple-100';
      case 'helping': return 'bg-emerald-100';
      default: return 'bg-amber-100';
    }
  };

  return (
    <div className="relative">
      <motion.div 
        className={`w-14 h-14 rounded-full ${getMascotBackground()} flex items-center justify-center shadow-md`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring" as any,
          stiffness: 260,
          damping: 20
        }}
      >
        <span className="text-2xl">{getMascotEmoji()}</span>
      </motion.div>
      
      {/* Speech bubble with message - positioning fixed to appear on top instead of to the right */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl p-3 shadow-md max-w-xs z-10"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-t-0 border-transparent border-b-white"></div>
            <p className="text-sm text-gray-700">{message}</p>
            {onMessageClose && (
              <button 
                onClick={onMessageClose}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponMascot;