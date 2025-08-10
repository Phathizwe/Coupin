import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MobileActionButtonProps {
  label: string;
  path: string;
  icon: string;
  bgColor: string;
  textColor: string;
  onClick?: () => void;
}

const MobileActionButton: React.FC<MobileActionButtonProps> = ({ 
  label, 
  path, 
  icon, 
  bgColor,
  textColor,
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path !== '#') {
      navigate(path);
    }
  };
  
  // Function to render the appropriate icon based on the icon name
  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'plus-circle':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ticket':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className="relative overflow-hidden cursor-pointer"
    >
      <div className={`bg-gradient-to-r ${bgColor} rounded-xl p-4 mb-4 shadow-md transform transition-transform active:scale-95 touch-action-manipulation`}>
        <div className={`flex items-center ${textColor}`}>
          <div className="bg-white/20 rounded-full p-2 mr-4">
            {renderIcon(icon)}
          </div>
          <span className="text-lg font-medium">{label}</span>
          <div className="ml-auto">
            <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileActionButtonsProps {
  buttons: {
    label: string;
    path: string;
    icon: string;
    bgColor: string;
    textColor: string;
    onClick?: () => void;
  }[];
}

const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({ buttons }) => {
  return (
    <div>
      {buttons.map((button, index) => (
        <MobileActionButton 
          key={index}
          label={button.label}
          path={button.path}
          icon={button.icon}
          bgColor={button.bgColor}
          textColor={button.textColor}
          onClick={button.onClick}
        />
      ))}
    </div>
  );
};

export default MobileActionButtons;