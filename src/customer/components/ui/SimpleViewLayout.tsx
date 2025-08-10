import React from 'react';
import WelcomeBanner from './WelcomeBanner';
import SavingsProgressSection from './SavingsProgressSection';
import CouponsContent from './CouponsContent';
import CelebrationOverlay from '../emotional/CelebrationOverlay';
import AchievementNotification from '../emotional/AchievementNotification';
import { ExtendedUser } from '../../../contexts/auth/types/extendedTypes';

interface SimpleViewLayoutProps {
  user: ExtendedUser | null;
  viewMode: 'default' | 'simple';
  onViewModeChange: (mode: 'default' | 'simple') => void;
  welcomeMessage: string;
  subMessage: string;
  mascotEmoji: string;
  monthlySaved: number;
  monthlySavingsGoal: number;
  showCelebration: boolean;
  achievementUnlocked: string | null;
  onCouponAction: (message: string) => void;
}

const SimpleViewLayout: React.FC<SimpleViewLayoutProps> = ({
  user,
  viewMode,
  onViewModeChange,
  welcomeMessage,
  subMessage,
  mascotEmoji,
  monthlySaved,
  monthlySavingsGoal,
  showCelebration,
  achievementUnlocked,
  onCouponAction
}) => {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white min-h-screen">
      {showCelebration && <CelebrationOverlay />}
      {achievementUnlocked && <AchievementNotification message={achievementUnlocked} />}
      
      {/* Removed SimpleHeader component to avoid duplication */}
      
      <WelcomeBanner 
        welcomeMessage={welcomeMessage} 
        subMessage={subMessage} 
        mascotEmoji={mascotEmoji} 
      />
      
      <SavingsProgressSection 
        monthlySaved={monthlySaved} 
        monthlySavingsGoal={monthlySavingsGoal} 
      />
      
      <CouponsContent 
        user={user} 
        mascotEmoji={mascotEmoji} 
        onCouponAction={onCouponAction} 
      />
    </div>
  );
};

export default SimpleViewLayout;