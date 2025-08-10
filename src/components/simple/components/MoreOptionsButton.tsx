import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MoreOptionsButtonProps {
  className?: string;
  textColor?: string;
}

const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({ 
  className = "mt-4 text-center",
  textColor = "text-gray-500 hover:text-primary-600"
}) => {
  const navigate = useNavigate();
  
  return (
    <div className={className}>
      <button 
        onClick={() => navigate('/business/dashboard')}
        className={`text-sm ${textColor}`}
      >
        More options
      </button>
    </div>
  );
};

export default MoreOptionsButton;