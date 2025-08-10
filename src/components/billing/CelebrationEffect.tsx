import React, { useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { triggerConfetti, triggerStarBurst } from '../../utils/animation.utils';

interface CelebrationEffectProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  show,
  message,
  onComplete
}) => {
  // Animation for the modal
  const modalAnimation = useSpring({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(-50px)',
    config: { tension: 300, friction: 20 }
  });
  
  // Trigger confetti when shown
  useEffect(() => {
    if (show) {
      // First burst
      triggerConfetti();
      
      // Second burst after a delay
      setTimeout(() => {
        triggerStarBurst();
      }, 300);
      
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      <animated.div 
        style={modalAnimation}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center relative z-10"
      >
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-700 text-lg mb-6">{message}</p>
        
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          Continue
        </button>
      </animated.div>
    </div>
  );
};

export default CelebrationEffect;