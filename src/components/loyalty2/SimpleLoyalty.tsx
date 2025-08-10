import React, { useState, useEffect } from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import CreateLoyaltyProgramModal from './EmotionalCreateLoyaltyModal';
import LoyaltyMascot from './LoyaltyMascot';
import LoyaltyProgressCard from './LoyaltyProgressCard';
import LoyaltyRewardsList from './LoyaltyRewardsList';
import LoyaltyActionButtons from './LoyaltyActionButtons';
import LoyaltyScanModal from './LoyaltyScanModal';
import LoyaltySendCouponModal from './LoyaltySendCouponModal';
import LoyaltyRewardModal from './LoyaltyRewardModal';

interface SimpleLoyaltyProps {
  loyaltyProgram: LoyaltyProgram | null;
  loyaltyRewards: LoyaltyReward[];
  businessId: string;
  onProgramSaved: (program: LoyaltyProgram) => void;
  onRewardsChange: (rewards: LoyaltyReward[]) => void;
  onBackClick: () => void;
}

const SimpleLoyalty: React.FC<SimpleLoyaltyProps> = ({
  loyaltyProgram,
  loyaltyRewards,
  businessId,
  onProgramSaved,
  onRewardsChange,
  onBackClick
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'neutral'>(
    loyaltyProgram?.active ? 'happy' : 'neutral'
  );
  const [showTip, setShowTip] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Hide tip after delay
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTip]);

  // Reset action success flag after animation
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  // Handle program creation or update with celebration
  const handleProgramSaved = (updatedProgram: LoyaltyProgram) => {
    onProgramSaved(updatedProgram);
    setShowCreateModal(false);
    setMascotMood('excited');
    setShowCelebration(true);

    // Reset celebration after delay
    setTimeout(() => {
      setShowCelebration(false);
      setTimeout(() => setMascotMood('happy'), 500);
    }, 3000);
  };

  // Handle successful action completion
  const handleActionSuccess = () => {
    setActionSuccess(true);
    setMascotMood('excited');
    
    // Close any open modals
    setShowScanModal(false);
    setShowCouponModal(false);
    setShowRewardModal(false);
    
    // Reset mascot mood after animation
    setTimeout(() => {
      setMascotMood('happy');
    }, 3000);
  };

  return (
    <div className="h-full bg-gradient-to-b from-purple-50 to-white max-w-3xl mx-auto animate-fadeIn">
      {/* Back button */}
      <div className="pt-4 px-6">
        <button
          onClick={onBackClick}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Header with personalized greeting */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white mt-4 pt-8 pb-12 px-6 rounded-b-3xl shadow-lg">
        <div className="animate-slideDown">
          <h1 className="text-2xl font-bold mt-1 flex items-center">
            Loyalty Program
            <span className="ml-2 text-2xl">✨</span>
          </h1>
          <p className="mt-2 text-purple-100 font-medium">
            {loyaltyProgram?.active
              ? "Reward your loyal customers and watch them return!"
              : "Create a loyalty program to turn customers into fans!"}
          </p>
        </div>

        <div className="mt-6">
          {loyaltyProgram ? (
            <LoyaltyProgressCard program={loyaltyProgram} />
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🎁</span>
                </div>
                <p className="text-white font-medium">No active program</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 px-4 py-2 bg-white text-purple-600 rounded-full font-medium text-sm hover:bg-purple-100 transition-colors"
                >
                  Create Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 -mt-6">
        {/* Quick action buttons */}
        {loyaltyProgram && loyaltyProgram.active && (
          <LoyaltyActionButtons
            program={loyaltyProgram}
            onScanClick={() => setShowScanModal(true)}
            onSendCouponClick={() => setShowCouponModal(true)}
            onRewardClick={() => setShowRewardModal(true)}
          />
        )}

        <div className="bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-900">
              {loyaltyProgram?.active ? "Program Status" : "Get Started"}
            </h2>
            <div className="w-12 h-12">
              <LoyaltyMascot mood={mascotMood} small />
            </div>
          </div>

          {loyaltyProgram ? (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h3 className="font-medium text-purple-800">{loyaltyProgram.name}</h3>
                <p className="text-sm text-purple-600 mt-1">{loyaltyProgram.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${loyaltyProgram.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {loyaltyProgram.active ? 'Active' : 'Draft'}
                  </span>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Edit Program
                  </button>
                </div>
              </div>

              {/* Program Type Info */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    {loyaltyProgram.type === 'points' ? '🏆' :
                      loyaltyProgram.type === 'visits' ? '🔄' : '🏅'}
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-800">
                      {loyaltyProgram.type === 'points' ? 'Points Program' :
                        loyaltyProgram.type === 'visits' ? 'Visit-Based Program' : 'Tiered Program'}
                    </h3>
                    <p className="text-xs text-indigo-600">
                      {loyaltyProgram.type === 'points' ?
                        `${loyaltyProgram.pointsPerAmount} points per purchase` :
                        loyaltyProgram.type === 'visits' ?
                          `${loyaltyProgram.visitsRequired} visits for reward` :
                          `${loyaltyProgram.tiers?.length || 0} loyalty tiers`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="text-lg font-medium text-purple-800 mb-2">Create Your First Loyalty Program</h3>
              <p className="text-sm text-purple-600 mb-4">
                Loyal customers spend 67% more than new ones. Start rewarding loyalty today!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
              >
                Create Loyalty Program
              </button>
            </div>
          )}
        </div>

        {/* Rewards Section */}
        {loyaltyProgram && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out delay-100 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-purple-900">Customer Rewards</h2>
            </div>

            <LoyaltyRewardsList
              rewards={loyaltyRewards}
              program={loyaltyProgram}
              onRewardsChange={onRewardsChange}
            />
          </div>
        )}

        {/* Success Tip */}
        {showTip && (
          <div className="mt-6 mb-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-5 hover:scale-102 transition-transform animate-slideUp">
            <div className="flex items-start">
              <div className="mr-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full p-2 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Loyalty Tip</h3>
                <p className="text-sm text-purple-800 mt-1">
                  Businesses with loyalty programs see an average <span className="font-bold">30% increase</span> in customer retention. Make your rewards meaningful and achievable!
                </p>
              </div>
              <button
                onClick={() => setShowTip(false)}
                className="ml-2 text-purple-400 hover:text-purple-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Success Indicator */}
      {actionSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md animate-slideInRight">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">Action completed successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateLoyaltyProgramModal
          initialData={loyaltyProgram || undefined}
          businessId={businessId}
          onSave={handleProgramSaved}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showScanModal && loyaltyProgram && (
        <LoyaltyScanModal
          program={loyaltyProgram}
          onClose={() => setShowScanModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showCouponModal && loyaltyProgram && (
        <LoyaltySendCouponModal
          program={loyaltyProgram}
          onClose={() => setShowCouponModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showRewardModal && loyaltyProgram && (
        <LoyaltyRewardModal
          program={loyaltyProgram}
          onClose={() => setShowRewardModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl p-8 shadow-xl max-w-md text-center transform animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              {loyaltyProgram?.active ? 'Program Updated!' : 'Program Created!'}
            </h2>
            <p className="text-gray-600">
              Your customers will love this loyalty program!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleLoyalty;