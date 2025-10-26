import React from 'react';
import { LoyaltyProgram } from '../../types';
import { useNavigate } from 'react-router-dom';

// Import emotional components
import LoyaltyHeader from './EmotionalComponents/LoyaltyHeader';
import LoyaltyPulse from './EmotionalComponents/LoyaltyPulse';
import CelebrationStation from './EmotionalComponents/CelebrationStation';
import LoyaltyJourney from './EmotionalComponents/LoyaltyJourney';
import RewardsCelebration from './EmotionalComponents/RewardsCelebration';

// Simplified interface for view mode only
interface SimpleLoyaltyProps {
  program: LoyaltyProgram;
  onInviteMember: () => void;
  onScanQR: () => void;
  onReward: () => void;
  onBackClick: () => void;
}

const SimpleLoyalty: React.FC<SimpleLoyaltyProps> = ({ 
  program, 
  onInviteMember, 
  onScanQR, 
  onReward, 
  onBackClick 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <LoyaltyHeader 
        title="Loyalty Program" 
        subtitle="Build meaningful relationships with your customers and watch them return again and again!"
        showBackButton={true}
        backUrl="/business/dashboard"
        mascotMood="happy"
        onBackClick={onBackClick}
      />

      <LoyaltyPulse program={program} />
      
      <CelebrationStation 
        onInviteMember={onInviteMember}
        onScanQR={onScanQR}
        onReward={onReward}
      />
      
      <LoyaltyJourney 
        program={program} 
        onEditClick={(programId) => navigate(`/business/loyalty/edit/${programId}`)} 
      />
      
      <RewardsCelebration program={program} />
    </div>
  );
};

export default SimpleLoyalty;

