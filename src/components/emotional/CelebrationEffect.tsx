import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  type: 'confetti' | 'sparkle' | 'achievement';
  isVisible: boolean;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ type, isVisible }) => {
  // Trigger confetti effect when visible
  React.useEffect(() => {
    if (isVisible && type === 'confetti') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isVisible, type]);

  // Different celebration messages based on type
  const getMessage = () => {
    switch (type) {
      case 'confetti':
        return 'Woohoo! Great job!';
      case 'sparkle':
        return 'Amazing work!';
      case 'achievement':
        return 'Achievement unlocked!';
      default:
        return 'Congratulations!';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Sparkle effect */}
          {type === 'sparkle' && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 opacity-30 blur-xl"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: [0, 1], opacity: [0, 0.8, 0], rotate: 90 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute w-60 h-60 rounded-full border-4 border-yellow-400 opacity-20"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5], opacity: [0, 0.5, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute w-20 h-20 rounded-full bg-yellow-400 opacity-30 blur-md"
              />
            </div>
          )}

          {/* Achievement badge */}
          {type === 'achievement' && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0, y: 50, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }}
                className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center max-w-xs"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: 1
                  }}
                  className="text-5xl mb-4"
                >
                  🏆
                </motion.div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Achievement Unlocked!</h3>
                <p className="text-gray-600 text-center">You're making great progress with your coupons!</p>
              </motion.div>
            </div>
          )}

          {/* Toast message for all types */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 z-50 flex items-center"
          >
            <span className="text-xl mr-2">
              {type === 'confetti' ? '🎉' : type === 'sparkle' ? '✨' : '🏆'}
            </span>
            <span className="font-medium text-gray-800">{getMessage()}</span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CelebrationEffect;