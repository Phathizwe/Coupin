import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  label: string;
  description: string;
  path: string;
  icon: string;
  bgColor: string;
  hoverEffect: string;
  textColor: string;
  index: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  description,
  path,
  icon,
  bgColor,
  hoverEffect,
  textColor,
  index
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    navigate(path);
  };

  const renderIcon = () => {
    switch (icon) {
      case 'gift':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'qrcode':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`w-full py-6 px-4 bg-gradient-to-r ${bgColor} ${textColor} rounded-xl shadow-lg 
                 hover:shadow-xl ${hoverEffect} transition-all duration-300 flex items-center
                 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
      aria-label={label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="bg-white/30 rounded-full p-3 mr-4">
        {renderIcon()}
      </div>
      <div className="text-left">
        <div className="text-xl font-bold">{label}</div>
        <div className="text-sm opacity-90 mt-1">{description}</div>
      </div>
    </motion.button>
  );
};

interface EmotionalActionButtonsProps {
  buttons: {
    label: string;
    description: string;
    path: string;
    icon: string;
    bgColor: string;
    hoverEffect: string;
    textColor: string;
  }[];
}

const EmotionalActionButtons: React.FC<EmotionalActionButtonsProps> = ({ buttons }) => {
  return (
    <div className="flex flex-col justify-center gap-4 py-2">
      {buttons.map((button, index) => (
        <ActionButton
          key={index}
          label={button.label}
          description={button.description}
          path={button.path}
          icon={button.icon}
          bgColor={button.bgColor}
          hoverEffect={button.hoverEffect}
          textColor={button.textColor}
          index={index}
        />
      ))}
    </div>
  );
};

export default EmotionalActionButtons;
