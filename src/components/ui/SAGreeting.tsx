import React, { useState, useEffect } from 'react';
import { SOUTH_AFRICAN } from '../../constants/brandConstants';

interface SAGreetingProps {
  className?: string;
  rotate?: boolean;
}

const SAGreeting: React.FC<SAGreetingProps> = ({ 
  className = '',
  rotate = true
}) => {
  const [currentGreeting, setCurrentGreeting] = useState(SOUTH_AFRICAN.greetings[0]);
  
  useEffect(() => {
    if (!rotate) return;
    
    // Rotate through greetings every 10 seconds
    const interval = setInterval(() => {
      const currentIndex = SOUTH_AFRICAN.greetings.indexOf(currentGreeting);
      const nextIndex = (currentIndex + 1) % SOUTH_AFRICAN.greetings.length;
      setCurrentGreeting(SOUTH_AFRICAN.greetings[nextIndex]);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentGreeting, rotate]);
  
  return (
    <div className={`text-primary-700 font-medium ${className}`}>
      {currentGreeting}
    </div>
  );
};

export default SAGreeting;