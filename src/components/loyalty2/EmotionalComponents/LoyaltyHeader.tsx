import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoyaltyMascot from '../LoyaltyMascot';

interface LoyaltyHeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backUrl?: string;
  mascotMood?: 'happy' | 'excited' | 'neutral';
  onBackClick?: () => void;
}

const LoyaltyHeader: React.FC<LoyaltyHeaderProps> = ({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backUrl = '/business/dashboard',
  mascotMood = 'happy',
  onBackClick
}) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(backUrl);
    }
  };
  
  return (
    <div className="mb-6">
      {showBackButton && (
        <div className="mb-4 flex items-center">
          <button 
            onClick={handleBackClick} 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <svg 
              className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-50 rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute right-2 top-2">
          <LoyaltyMascot mood={mascotMood} size="medium" />
        </div>
        
        <h1 className="text-2xl font-bold text-purple-800 mb-2 flex items-center">
          {title}
          <span className="ml-2 text-purple-500">✨</span>
        </h1>
        
        <p className="text-purple-700 mb-2 max-w-lg">
          {subtitle}
        </p>
        
        <div className="flex space-x-2 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Build Relationships
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Increase Retention
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Grow Revenue
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyHeader;