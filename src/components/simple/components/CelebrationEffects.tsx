import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationEffectsProps {
  show: boolean;
  type: 'confetti' | 'sparkle' | 'bounce' | 'pulse' | 'none';
  message?: string;
}

const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  show,
  type,
  message = 'Success!'
}) => {
  // Don't render anything if not showing
  if (!show) return null;

  // Confetti effect
  const renderConfetti = () => {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
                    key={i}
                    className="absolute"
                    initial={{
              top: '-10%',
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][
                Math.floor(Math.random() * 6)
              ],
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
              opacity: 1,
                    }}
            animate={{
              top: '110%',
              rotate: Math.random() * 360,
              opacity: 0,
                    }}
            transition={{
              duration: Math.random() * 2 + 1,
              ease: 'easeOut',
                    }}
          />
        ))}
            </div>
    );
  };

  // Sparkle effect
  const renderSparkle = () => {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              top: '50%',
              left: '50%',
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              opacity: 1,
            }}
            animate={{
              top: `${50 + (Math.random() * 60 - 30)}%`,
              left: `${50 + (Math.random() * 60 - 30)}%`,
              scale: [1, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 1 + 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    );
};

  // Bounce effect
  const renderBounce = () => {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1.2, 1],
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <div className="bg-white rounded-full p-8 shadow-lg">
          <span className="text-4xl">🎉</span>
        </div>
      </motion.div>
    );
  };

  // Pulse effect
  const renderPulse = () => {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
        }}
      >
        <div className="bg-indigo-500 rounded-full w-full h-full opacity-20" />
      </motion.div>
    );
  };

  // Render the appropriate effect based on type
  const renderEffect = () => {
    switch (type) {
      case 'confetti':
        return renderConfetti();
      case 'sparkle':
        return renderSparkle();
      case 'bounce':
        return renderBounce();
      case 'pulse':
        return renderPulse();
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {renderEffect()}
          
          {/* Toast message */}
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationEffects;