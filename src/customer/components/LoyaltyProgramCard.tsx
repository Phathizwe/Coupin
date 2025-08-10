import React from 'react';
import { Link } from 'react-router-dom';
import { CustomerLoyaltyProgram } from '../types/loyalty';

interface LoyaltyProgramCardProps {
  program: CustomerLoyaltyProgram;
}

const LoyaltyProgramCard: React.FC<LoyaltyProgramCardProps> = ({ program }) => {
  const {
    id,
    name,
    description,
    type,
    businessName,
    businessLogo,
    businessColors,
    customerPoints = 0,
    customerVisits = 0,
    customerTier = '',
    pointsPerAmount,
    visitsRequired,
    tiers = []
  } = program;

  // Get the primary and secondary colors for styling
  const primaryColor = businessColors?.primary || '#3B82F6';
  const secondaryColor = businessColors?.secondary || '#10B981';
  const lightPrimaryColor = `${primaryColor}20`; // 20% opacity version for backgrounds

  // Calculate progress for the progress bar
  const calculateProgress = () => {
    if (type === 'points' && pointsPerAmount) {
      // For points-based programs, show progress to next reward tier if available
      if (tiers && tiers.length > 0) {
        // Sort tiers by threshold
        const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
        
        // Find the next tier
        for (const tier of sortedTiers) {
          if (customerPoints < tier.threshold) {
            return (customerPoints / tier.threshold) * 100;
          }
        }
        // If customer has reached all tiers
        return 100;
      }
      // Default progress calculation for points
      return Math.min(customerPoints / 100, 100);
    } else if (type === 'visits' && visitsRequired) {
      // For visit-based programs
      return Math.min((customerVisits / visitsRequired) * 100, 100);
    } else if (type === 'tiered' && tiers && tiers.length > 0) {
      // For tiered programs
      const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
      
      // Find current tier index
      const currentTierIndex = sortedTiers.findIndex(tier => tier.name === customerTier);
      
      if (currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1) {
        // Calculate progress to next tier
        const currentThreshold = sortedTiers[currentTierIndex].threshold;
        const nextThreshold = sortedTiers[currentTierIndex + 1].threshold;
        return ((customerPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
      }
      
      // If at highest tier or no tier found
      return currentTierIndex === sortedTiers.length - 1 ? 100 : 0;
    }
    
    return 0;
  };

  // Format the progress message based on program type
  const getProgressMessage = () => {
    if (type === 'points') {
      return `${customerPoints} points earned`;
    } else if (type === 'visits') {
      return `${customerVisits} ${customerVisits === 1 ? 'visit' : 'visits'} completed`;
    } else if (type === 'tiered') {
      return `${customerTier} tier (${customerPoints} points)`;
    }
    return '';
  };

  // Get the next milestone message
  const getNextMilestoneMessage = () => {
    if (type === 'points' && pointsPerAmount) {
      // For points-based programs
      if (tiers && tiers.length > 0) {
        // Sort tiers by threshold
        const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
        
        // Find the next tier
        for (const tier of sortedTiers) {
          if (customerPoints < tier.threshold) {
            return `${tier.threshold - customerPoints} more points to reach ${tier.name} tier`;
          }
        }
        return 'You\'ve reached the highest tier!';
      }
      return 'Earn points with every purchase';
    } else if (type === 'visits' && visitsRequired) {
      // For visit-based programs
      const remainingVisits = visitsRequired - customerVisits;
      if (remainingVisits <= 0) {
        return 'You\'ve earned a reward!';
      }
      return `${remainingVisits} more ${remainingVisits === 1 ? 'visit' : 'visits'} to earn a reward`;
    } else if (type === 'tiered' && tiers && tiers.length > 0) {
      // For tiered programs
      const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
      
      // Find current tier index
      const currentTierIndex = sortedTiers.findIndex(tier => tier.name === customerTier);
      
      if (currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1) {
        // Calculate points needed for next tier
        const nextTier = sortedTiers[currentTierIndex + 1];
        return `${nextTier.threshold - customerPoints} more points to reach ${nextTier.name} tier`;
      }
      
      return currentTierIndex === sortedTiers.length - 1 
        ? 'You\'ve reached the highest tier!' 
        : 'Start earning points to reach higher tiers';
    }
    
    return '';
  };

  const progress = calculateProgress();

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md"
      style={{ borderColor: `${primaryColor}30` }}
    >
      {/* Business header */}
      <div 
        className="p-4 flex items-center border-b"
        style={{ borderColor: `${primaryColor}20` }}
      >
        {businessLogo ? (
          <img 
            src={businessLogo} 
            alt={businessName || 'Business'} 
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
            style={{ backgroundColor: primaryColor }}
          >
            {businessName ? businessName.charAt(0).toUpperCase() : 'B'}
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900">{businessName}</h3>
          <p className="text-xs text-gray-500">Loyalty Program</p>
        </div>
      </div>

      {/* Program content */}
      <div className="p-4">
        <h2 
          className="text-lg font-semibold mb-2"
          style={{ color: primaryColor }}
        >
          {name}
        </h2>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        {/* Progress section */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{getProgressMessage()}</span>
            <span>{type === 'tiered' ? customerTier : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: primaryColor
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{getNextMilestoneMessage()}</p>
        </div>
      </div>

      {/* Footer with action button */}
      <div 
        className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center"
        style={{ borderColor: `${primaryColor}20`, backgroundColor: lightPrimaryColor }}
      >
        <span className="text-xs text-gray-500">
          {type === 'points' ? 'Points-based' : type === 'visits' ? 'Visit-based' : 'Tiered program'}
        </span>
        <Link
          to={`/customer/loyalty/${id}`}
          className="px-4 py-1.5 text-white text-sm rounded-md transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default LoyaltyProgramCard;