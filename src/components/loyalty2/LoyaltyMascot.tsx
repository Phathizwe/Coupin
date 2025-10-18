import React, { useState, useEffect } from 'react';

interface LoyaltyMascotProps {
  mood: 'happy' | 'excited' | 'neutral';
  size?: 'small' | 'medium' | 'large';
}

const LoyaltyMascot: React.FC<LoyaltyMascotProps> = ({ mood, size = 'medium' }) => {
  const [animation, setAnimation] = useState('');
  
  useEffect(() => {
    // Set animation based on mood
    switch (mood) {
      case 'happy':
        setAnimation('animate-bounce');
        break;
      case 'excited':
        setAnimation('animate-pulse');
        break;
      case 'neutral':
      default:
        setAnimation('');
        break;
    }
    
    // Reset animation after a while
    const timer = setTimeout(() => {
      setAnimation('');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [mood]);
  
  const getMascotEmoji = () => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🤩';
      case 'neutral':
      default:
        return '🙂';
    }
  };
  
  const sizeClasses = {
    small: 'w-10 h-10 text-xl',
    medium: 'w-16 h-16 text-3xl',
    large: 'w-20 h-20 text-4xl'
  };
  
  const [containerClass, textClass] = sizeClasses[size].split(' ');
  
  return (
    <div 
      className={`${containerClass} bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md ${animation}`}
    >
      <span className={textClass}>
        {getMascotEmoji()}
      </span>
    </div>
  );
};

export default LoyaltyMascot;