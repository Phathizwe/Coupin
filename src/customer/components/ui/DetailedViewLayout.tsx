import React from 'react';
import CustomerCoupons from '../../CustomerCoupons';
import SavingsMascot from '../emotional/SavingsMascot';
import SavingsProgress from '../emotional/SavingsProgress';
import CelebrationOverlay from '../emotional/CelebrationOverlay';
import AchievementNotification from '../emotional/AchievementNotification';
import { ExtendedUser } from '../../../contexts/auth/types/extendedTypes';

interface DetailedViewLayoutProps {
  user: ExtendedUser | null;
  viewMode: 'default' | 'simple';
  onViewModeChange: (mode: 'default' | 'simple') => void;
  welcomeMessage: string;
  subMessage: string;
  mascotState: string;
  mascotStateType: 'welcoming' | 'encouraging' | 'celebrating' | 'grateful';
  savingsStreak: number;
  totalSaved: number;
  monthlySaved: number;
  monthlySavingsGoal: number;
  showCelebration: boolean;
  achievementUnlocked: string | null;
  onCouponAction: (message: string) => void;
  onMascotStateChange: (state: 'welcoming' | 'encouraging' | 'celebrating' | 'grateful') => void;
}

const DetailedViewLayout: React.FC<DetailedViewLayoutProps> = ({
  user,
  viewMode,
  onViewModeChange,
  welcomeMessage,
  subMessage,
  mascotState,
  mascotStateType,
  savingsStreak,
  totalSaved,
  monthlySaved,
  monthlySavingsGoal,
  showCelebration,
  achievementUnlocked,
  onCouponAction,
  onMascotStateChange
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {showCelebration && <CelebrationOverlay />}
      {achievementUnlocked && <AchievementNotification message={achievementUnlocked} />}

      {/* Removed SimpleHeader to avoid duplication */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{welcomeMessage}</h1>
          <p className="text-primary-600">{subMessage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 shadow-sm border border-primary-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-primary-800">Savings Streak</h3>
            <div className="p-2 bg-white rounded-full text-primary-600 shadow-sm">
              <span className="text-xl">🔥</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-primary-700">{savingsStreak}</span>
            <span className="ml-2 text-primary-600">days</span>
          </div>
          <p className="mt-2 text-sm text-primary-600">Keep using coupons to maintain your streak!</p>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 shadow-sm border border-secondary-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-800">Total Saved</h3>
            <div className="p-2 bg-white rounded-full text-secondary-600 shadow-sm">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-secondary-700">R{totalSaved}</span>
          </div>
          <p className="mt-2 text-sm text-secondary-600">Your lifetime savings with our coupons</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-800">This Month</h3>
            <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
              <span className="text-xl">📅</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline mb-2">
              <span className="text-2xl font-bold text-blue-700">R{monthlySaved}</span>
              <span className="ml-2 text-blue-600">/ R{monthlySavingsGoal}</span>
            </div>
            <SavingsProgress currentAmount={monthlySaved} goalAmount={monthlySavingsGoal} variant="detailed" />
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-grow">
          {user ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">My Coupons</h2>
              <CustomerCoupons viewMode="default" onCouponAction={onCouponAction} />
            </div>
          ) : (
            <div className="p-6 bg-blue-50 text-blue-700 rounded-xl shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{mascotState}</div>
                <p>Please log in to view your coupons.</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-48 ml-6 hidden lg:block">
          <SavingsMascot
            state={mascotStateType}
            onStateChange={onMascotStateChange}
            savingsStreak={savingsStreak}
            monthlySaved={monthlySaved}
            totalSaved={totalSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedViewLayout;