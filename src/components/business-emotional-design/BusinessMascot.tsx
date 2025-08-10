import React, { useState, useEffect } from 'react';

interface BusinessMascotProps {
  state: 'welcome' | 'thinking' | 'happy' | 'excited' | 'idle';
  message: string;
  interactionCount: number;
  onClick: () => void;
}

const BusinessMascot: React.FC<BusinessMascotProps> = ({
  state,
  message,
  interactionCount,
  onClick
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show message automatically when state changes
  useEffect(() => {
    setShowMessage(true);
    
    // Auto-hide message after some time
      const timer = setTimeout(() => {
      setShowMessage(false);
    }, 8000);
    
      return () => clearTimeout(timer);
  }, [state, message]);
  
  // Handle animation state
  useEffect(() => {
    if (state === 'excited' || state === 'happy') {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Get mascot emoji based on state
  const getMascotEmoji = () => {
    switch (state) {
      case 'welcome': return '👋';
      case 'thinking': return '🤔';
      case 'happy': return '😊';
      case 'excited': return '🎉';
      case 'idle': return '👀';
      default: return '👋';
    }
  };

  // Get animation class based on state
  const getAnimationClass = () => {
    if (!isAnimating) return '';
    
    switch (state) {
      case 'excited': return 'animate-bounce';
      case 'happy': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <div className="relative">
      {/* Message bubble */}
      {showMessage && (
        <div className="absolute bottom-full right-0 mb-3 w-64 transform transition-all duration-300 ease-out origin-bottom-right" style={{
          opacity: showMessage ? 1 : 0,
          transform: showMessage ? 'scale(1)' : 'scale(0.8)',
        }}>
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
        </div>
      )}
      
      {/* Mascot */}
      <button
        onClick={() => {
          onClick();
          setShowMessage(true);
        }}
        className={`w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border-2 border-primary-200 hover:border-primary-400 transition-all duration-300 ${getAnimationClass()}`}
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        {getMascotEmoji()}
      </button>
      
      {/* Interaction indicator */}
      {interactionCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {Math.min(interactionCount, 9)}
    </div>
      )}
    </div>
  );
};

export default BusinessMascot;