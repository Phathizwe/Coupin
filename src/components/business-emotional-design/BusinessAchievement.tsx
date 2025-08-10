import React, { useState, useEffect } from 'react';

interface BusinessAchievementProps {
  title: string;
  description: string;
  icon: string;
  isNew?: boolean;
  progress?: number;
  maxProgress?: number;
}

const BusinessAchievement: React.FC<BusinessAchievementProps> = ({
  title,
  description,
  icon,
  isNew = false,
  progress = 0,
  maxProgress = 100
}) => {
  const [showNewBadge, setShowNewBadge] = useState(isNew);
  
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);
  
  const progressPercentage = Math.min((progress / maxProgress) * 100, 100);
  const isComplete = progress >= maxProgress;
  
  return (
    <div className={`border rounded-lg p-4 ${isComplete ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isComplete ? 'bg-primary-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {showNewBadge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded-full animate-pulse">
                NEW!
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      
      {!isComplete && maxProgress > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {isComplete && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-primary-600 font-medium">Completed!</span>
          <span className="text-primary-600">🏆</span>
        </div>
      )}
    </div>
  );
};

export default BusinessAchievement;