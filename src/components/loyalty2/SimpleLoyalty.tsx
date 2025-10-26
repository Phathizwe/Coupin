import React from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import { useNavigate } from 'react-router-dom';

// Import emotional components
import LoyaltyHeader from './EmotionalComponents/LoyaltyHeader';
import LoyaltyPulse from './EmotionalComponents/LoyaltyPulse';
import CelebrationStation from './EmotionalComponents/CelebrationStation';
import LoyaltyJourney from './EmotionalComponents/LoyaltyJourney';
import RewardsCelebration from './EmotionalComponents/RewardsCelebration';

// Updated interface to match both usage patterns
interface SimpleLoyaltyProps {
  // Support both naming conventions
  program?: LoyaltyProgram;
  loyaltyProgram?: LoyaltyProgram | null;
  loyaltyRewards?: LoyaltyReward[];
  businessId?: string;
  onProgramSaved?: (programData: LoyaltyProgram) => Promise<void>;
  onRewardsChange?: (updatedRewards: LoyaltyReward[]) => void;
  onInviteMember?: () => void;
  onScanQR?: () => void;
  onReward?: () => void;
  onBackClick: () => void;
}

const SimpleLoyalty: React.FC<SimpleLoyaltyProps> = ({ 
  program,
  loyaltyProgram,
  onInviteMember, 
  onScanQR, 
  onReward, 
  onBackClick 
}) => {
  const navigate = useNavigate();
  
  // Use either program or loyaltyProgram, whichever is provided
  const effectiveProgram = program || loyaltyProgram || null;
  
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

      {effectiveProgram && <LoyaltyPulse program={effectiveProgram} />}
      
      <CelebrationStation 
        onInviteMember={onInviteMember || (() => {})}
        onScanQR={onScanQR || (() => {})}
        onReward={onReward || (() => {})}
      />
      
      {effectiveProgram && (
        <LoyaltyJourney 
          program={effectiveProgram} 
          onEditClick={(programId) => navigate(`/business/loyalty/edit/${programId}`)} 
        />
      )}
      
      {effectiveProgram && <RewardsCelebration program={effectiveProgram} />}
    </div>
  );
};

export default SimpleLoyalty;