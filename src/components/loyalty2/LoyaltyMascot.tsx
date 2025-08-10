import React, { useState, useEffect } from 'react';

interface LoyaltyMascotProps {
  mood: 'happy' | 'excited' | 'neutral';
  small?: boolean;
}

const LoyaltyMascot: React.FC<LoyaltyMascotProps> = ({ mood, small = false }) => {
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
  
  return (
    <div 
      className={`${small ? 'w-10 h-10' : 'w-16 h-16'} bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md ${animation}`}
    >
      <span className={`${small ? 'text-xl' : 'text-3xl'}`}>
        {getMascotEmoji()}
      </span>
    </div>
  );
};

export default LoyaltyMascot;