import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonProps {
  label: string;
  path: string;
  bgColor: string;
  activeColor: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, path, bgColor, activeColor }) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(path)}
      className={`w-full py-8 ${bgColor} text-white text-2xl font-bold rounded-xl shadow-md ${activeColor} focus:outline-none`}
      aria-label={label}
    >
      {label}
    </button>
  );
};

interface ActionButtonsProps {
  buttons: {
    label: string;
    path: string;
    bgColor: string;
    activeColor: string;
  }[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ buttons }) => {
  return (
    <div className="flex-1 flex flex-col justify-center gap-6 p-6">
      {buttons.map((button, index) => (
        <ActionButton 
          key={index}
          label={button.label}
          path={button.path}
          bgColor={button.bgColor}
          activeColor={button.activeColor}
        />
      ))}
    </div>
  );
};

export default ActionButtons;