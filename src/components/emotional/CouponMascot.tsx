import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CouponMascotProps {
  mood: 'happy' | 'excited' | 'helping';
  message: string;
}

const CouponMascot: React.FC<CouponMascotProps> = ({ mood, message }) => {
  const [showMessage, setShowMessage] = useState(true);
  
  // Auto-hide message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message]);
  
  // Mascot expressions based on mood
  const getMascotEmoji = () => {
    switch (mood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'helping': return '💡';
      default: return '😊';
    }
  };
  
  // Background colors based on mood
  const getMascotBackground = () => {
    switch (mood) {
      case 'happy': return 'bg-amber-100';
      case 'excited': return 'bg-purple-100';
      case 'helping': return 'bg-blue-100';
      default: return 'bg-amber-100';
    }
  };

  // Animations based on mood
  const happyAnimation = {
    y: [0, -5, 0],
    transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 2 }
  };
  
  const excitedAnimation = {
    rotate: [-5, 5, -5],
    scale: [1, 1.1, 1],
    transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 0.5 }
  };
  
  const helpingAnimation = {
    y: [0, -3, 0],
    x: [0, 3, 0],
    transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 1.5 }
  };

  // Get the appropriate animation based on mood
  const getAnimationForMood = () => {
    switch (mood) {
      case 'happy': return happyAnimation;
      case 'excited': return excitedAnimation;
      case 'helping': return helpingAnimation;
      default: return happyAnimation;
    }
  };

  return (
    <div className="relative">
      <motion.div 
        className={`w-16 h-16 rounded-full ${getMascotBackground()} flex items-center justify-center shadow-md cursor-pointer`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={getAnimationForMood()}
        onClick={() => setShowMessage(!showMessage)}
      >
        <span className="text-3xl">{getMascotEmoji()}</span>
      </motion.div>
      
      {/* Speech bubble with message */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            className="absolute top-full right-0 mt-2 bg-white rounded-xl p-3 shadow-md max-w-xs z-10"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute -top-2 right-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-t-0 border-transparent border-b-white"></div>
            <p className="text-sm text-gray-700">{message}</p>
            <button 
              onClick={() => setShowMessage(false)}
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponMascot;