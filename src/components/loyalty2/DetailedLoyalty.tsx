import React, { useState } from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import LoyaltyProgramDetails from '../loyalty/LoyaltyProgramDetails';
import LoyaltyProgramTabs from '../loyalty/LoyaltyProgramTabs';
import LoyaltyProgramsList from '../loyalty/LoyaltyProgramsList';
import LoyaltyHeader from './LoyaltyHeader';
import LoyaltyMascot from './LoyaltyMascot';
import LoyaltyInsights from './LoyaltyInsights';
import LoyaltyAchievements from './LoyaltyAchievements';
import LoyaltyMembersProgress from './LoyaltyMembersProgress';
import LoyaltyMembersList from './LoyaltyMembersList';
import DetailedLoyaltyActions from './DetailedLoyaltyActions';
import CreateLoyaltyProgramModal from './EmotionalCreateLoyaltyModal';
import LoyaltyScanModal from './LoyaltyScanModal';
import LoyaltySendCouponModal from './LoyaltySendCouponModal';
import LoyaltyRewardModal from './LoyaltyRewardModal';

interface DetailedLoyaltyProps {
  loyaltyProgram: LoyaltyProgram | null;
  loyaltyRewards: LoyaltyReward[];
  businessId: string;
  onProgramSaved: (program: LoyaltyProgram) => void;
  onRewardsChange: (rewards: LoyaltyReward[]) => void;
  showCelebration: boolean;
  onBackClick: () => void;
}

const DetailedLoyalty: React.FC<DetailedLoyaltyProps> = ({
  loyaltyProgram,
  loyaltyRewards,
  businessId,
  onProgramSaved,
  onRewardsChange,
  showCelebration,
  onBackClick
}) => {
  // View state management
  const [activeTab, setActiveTab] = useState('active');
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showMembersView, setShowMembersView] = useState(false);
  
  // Modal state management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  
  // UI state management
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'neutral'>(
    loyaltyProgram?.active ? 'happy' : 'neutral'
  );
  const [actionSuccess, setActionSuccess] = useState(false);

  // Get the appropriate programs based on the active tab
  const getDisplayPrograms = () => {
    if (!loyaltyProgram) return [];

    switch (activeTab) {
      case 'active':
        return loyaltyProgram.active ? [loyaltyProgram] : [];
      case 'draft':
        return !loyaltyProgram.active ? [loyaltyProgram] : [];
      case 'archived':
        return []; // No archived state in current model
      default:
        return [];
    }
  };

  const displayPrograms = getDisplayPrograms();

  // Handle program creation or update
  const handleProgramSaved = (updatedProgram: LoyaltyProgram) => {
    onProgramSaved(updatedProgram);
    setShowCreateModal(false);
    setMascotMood('excited');
    
    // Reset mascot mood after delay
    setTimeout(() => {
      setMascotMood('happy');
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
    
    // Reset states after animation
    setTimeout(() => {
      setActionSuccess(false);
      setMascotMood('happy');
    }, 3000);
  };

  // Render the members view
  if (showMembersView && loyaltyProgram) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowMembersView(false)}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Loyalty Program Members</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <LoyaltyMembersList />
        </div>
      </div>
    );
  }

  // Render the details view
  if (showDetailsView && loyaltyProgram) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowDetailsView(false)}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Loyalty Program Details</h1>
          </div>
        </div>

        <LoyaltyProgramDetails
          program={loyaltyProgram}
          rewards={loyaltyRewards}
          onRewardsChange={onRewardsChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <div className="flex items-center mb-4">
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

      <div className="flex justify-between">
        <div className="flex-1">
          <LoyaltyHeader
            hasProgram={!!loyaltyProgram}
            onCreateClick={() => setShowCreateModal(true)}
          />
        </div>
        <div className="w-24 h-24 relative">
          <LoyaltyMascot mood={mascotMood} />
        </div>
      </div>

      {/* Quick Actions Section - Only show for active programs */}
      {loyaltyProgram && loyaltyProgram.active && (
        <DetailedLoyaltyActions
          program={loyaltyProgram}
          onScanClick={() => setShowScanModal(true)}
          onSendCouponClick={() => setShowCouponModal(true)}
          onRewardClick={() => setShowRewardModal(true)}
        />
      )}

      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 shadow-md border border-purple-200">
        <LoyaltyProgramTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMascotMood(tab === 'active' ? 'happy' : 'neutral');
          }}
        />

        <div className="mt-6">
          <LoyaltyProgramsList
            programs={displayPrograms}
            activeTab={activeTab}
            onCreateClick={() => setShowCreateModal(true)}
            onViewDetails={() => setShowDetailsView(true)}
          />

          {activeTab === 'active' && displayPrograms.length > 0 && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-6">
                  <LoyaltyInsights
                    program={loyaltyProgram}
                    rewardsCount={loyaltyRewards.length}
                  />
                  <LoyaltyMembersProgress />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setShowMembersView(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                    >
                      View all members
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <LoyaltyAchievements program={loyaltyProgram} />
              </div>
            </div>
          )}

          {activeTab === 'draft' && !loyaltyProgram && (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-900 mb-2">Create Your First Loyalty Program</h3>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Loyal customers spend 67% more than new ones. Start rewarding loyalty today and watch your business grow!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
              >
                Get Started Now
              </button>
            </div>
          )}
        </div>
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

export default DetailedLoyalty;