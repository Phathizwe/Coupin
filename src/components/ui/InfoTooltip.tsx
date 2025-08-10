import React from 'react';
import Tooltip from './Tooltip';

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, position = 'top' }) => {
  return (
    <Tooltip text={text} position={position}>
      <svg 
        className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline-block ml-1" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
          clipRule="evenodd" 
        />
      </svg>
    </Tooltip>
  );
};

export default InfoTooltip;