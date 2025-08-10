import React from 'react';

interface ArrowButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  backgroundColor: string;
  foregroundColor: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({
  direction,
  onClick,
  backgroundColor,
  foregroundColor,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isNext = direction === 'next';
  
  return (
    <button
      className={`arrow-button ${direction}-button`}
      onClick={onClick}
      style={{ backgroundColor }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${isNext ? 'Next' : 'Previous'} testimonial`}
    >
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: foregroundColor }}
      >
        <path 
          d={isNext ? "M9 5L16 12L9 19" : "M15 19L8 12L15 5"}
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};