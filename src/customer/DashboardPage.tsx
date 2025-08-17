import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useOutletContext } from 'react-router-dom';
import { getSavingsStats } from './services/customerSavingsService';
import BusinessRouteCorrector from '../utils/BusinessRouteCorrector';
import CustomerCoupons from './CustomerCoupons';
import SavingsMascot from './components/emotional/SavingsMascot';
import SavingsProgress from './components/emotional/SavingsProgress';
import CelebrationOverlay from './components/emotional/CelebrationOverlay';
import AchievementNotification from './components/emotional/AchievementNotification';

// Define mascot state type
type MascotStateType = 'welcoming' | 'encouraging' | 'celebrating' | 'grateful';

// Mascot states
const MASCOT_STATES: Record<MascotStateType, string> = {
  welcoming: '👋',
  encouraging: '👍',
  celebrating: '🎉',
  grateful: '🙏',
};

// Messages
const MESSAGES = {
  streak: "On fire! [X] days of smart saving! 🔥",
  welcome: "Ready to start saving? Let's make it happen! 💪"
};

// Context type
type ContextType = {
  view: 'default' | 'simple';
};

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { view: viewMode } = useOutletContext<ContextType>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotState, setMascotState] = useState<MascotStateType>('welcoming');
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [savingsStreak, setSavingsStreak] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(500);
  const [monthlySaved, setMonthlySaved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Welcome message
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name = user?.displayName?.split(' ')[0] || 'there';

    if (hour < 12) return `Good morning, ${name}! 🌅`;
    if (hour < 18) return `Good afternoon, ${name}! ☀️`;
    return `Good evening, ${name}! 🌙`;
  };

  // Load real savings data
  useEffect(() => {
    if (user?.uid) {
      const loadSavingsData = async () => {
        setIsLoading(true);
        try {
          const stats = await getSavingsStats(user.uid);
          // Use the savingsStreak property that we added to the SavingsStats interface
          setSavingsStreak(stats.savingsStreak);
          setTotalSaved(stats.totalSaved);
          setMonthlySaved(stats.monthlySaved);
          setMonthlySavingsGoal(stats.monthlySavingsGoal);

          if (localStorage.getItem('lastVisit')) {
            setMascotState('welcoming');
          }
          localStorage.setItem('lastVisit', new Date().toISOString());
        } catch (error) {
          console.error('Error loading savings data:', error);
          setSavingsStreak(0);
          setTotalSaved(0);
          setMonthlySaved(0);
        } finally {
          setIsLoading(false);
        }
      };

      loadSavingsData();
    }
  }, [user?.uid]);

  // Check for achievements
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('redeemed') === 'true') {
      setShowCelebration(true);
      setMascotState('celebrating');
      setAchievementUnlocked('Coupon redeemed successfully!');

      setTimeout(() => {
        setShowCelebration(false);
        setMascotState('grateful');
      }, 3000);

      setTimeout(() => {
        setAchievementUnlocked(null);
      }, 5000);
    }
  }, [location]);

  // Celebration trigger
  const triggerCelebration = (message: string) => {
    setShowCelebration(true);
    setMascotState('celebrating');
    setAchievementUnlocked(message);

    setTimeout(() => {
      setShowCelebration(false);
      setMascotState('grateful');
    }, 3000);

    setTimeout(() => {
      setAchievementUnlocked(null);
    }, 5000);
  };

  // Get the appropriate sub-message
  const getSubMessage = () => {
    return savingsStreak > 0 
      ? MESSAGES.streak.replace('[X]', savingsStreak.toString()) 
      : MESSAGES.welcome;
  };

  // Loading state
  if (isLoading && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <BusinessRouteCorrector />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading your savings dashboard...</p>
        </div>
      </div>
    );
  }

  // Simple view
  if (viewMode === 'simple') {
    return (
      <div className="bg-gradient-to-b from-primary-50 to-white min-h-screen">
        <BusinessRouteCorrector />
        {showCelebration && <CelebrationOverlay />}
        {achievementUnlocked && <AchievementNotification message={achievementUnlocked} />}

        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-primary-800 mb-1">{getWelcomeMessage()}</h1>
          <p className="text-primary-600 text-sm">
            {getSubMessage()}
          </p>

          <div className="mt-4 flex justify-end items-center">
            <div className="text-3xl">{MASCOT_STATES[mascotState]}</div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <SavingsProgress currentAmount={monthlySaved} goalAmount={monthlySavingsGoal} variant="compact" />
        </div>

        <div className="bg-white rounded-t-3xl shadow-lg px-4 py-6 min-h-screen">
          {user ? (
            <CustomerCoupons viewMode="simple" onCouponAction={triggerCelebration} />
          ) : (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{MASCOT_STATES.encouraging}</div>
                <p>Please log in to view your coupons.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div>
      <BusinessRouteCorrector />
      {showCelebration && <CelebrationOverlay />}
      {achievementUnlocked && <AchievementNotification message={achievementUnlocked} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getWelcomeMessage()}</h1>
          <p className="text-primary-600">
            {getSubMessage()}
          </p>
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
              <CustomerCoupons viewMode="default" onCouponAction={triggerCelebration} />
            </div>
          ) : (
            <div className="p-6 bg-blue-50 text-blue-700 rounded-xl shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{MASCOT_STATES.encouraging}</div>
                <p>Please log in to view your coupons.</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-48 ml-6 hidden lg:block">
          <SavingsMascot
            state={mascotState}
            onStateChange={setMascotState}
            savingsStreak={savingsStreak}
            monthlySaved={monthlySaved}
            totalSaved={totalSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;