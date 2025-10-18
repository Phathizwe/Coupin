import React from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import { useNavigate } from 'react-router-dom';

// Import emotional components
import LoyaltyHeader from './EmotionalComponents/LoyaltyHeader';
import LoyaltyPulse from './EmotionalComponents/LoyaltyPulse';
import CelebrationStation from './EmotionalComponents/CelebrationStation';
import LoyaltyJourney from './EmotionalComponents/LoyaltyJourney';
import RewardsCelebration from './EmotionalComponents/RewardsCelebration';
import LoyaltyMascot from './LoyaltyMascot';

// Define a union type to handle both use cases
interface ViewProps {
  program: LoyaltyProgram;
  onInviteMember: () => void;
  onScanQR: () => void;
  onReward: () => void;
}

interface EditProps {
  loyaltyProgram: LoyaltyProgram | null;
  loyaltyRewards: LoyaltyReward[];
  businessId: string;
  onProgramSaved: (program: LoyaltyProgram) => void;
  onRewardsChange: (rewards: LoyaltyReward[]) => void;
  onBackClick: () => void;
}

// Use type predicates to determine which props are being used
function isViewProps(props: ViewProps | EditProps): props is ViewProps {
  return 'program' in props && 'onInviteMember' in props;
}

type SimpleLoyaltyProps = ViewProps | EditProps;

const SimpleLoyalty: React.FC<SimpleLoyaltyProps> = (props) => {
  const navigate = useNavigate();
  
  // Handle both prop patterns
  if (isViewProps(props)) {
    // View mode (emotionally enhanced implementation)
    const { program, onInviteMember, onScanQR, onReward } = props;
    
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <LoyaltyHeader 
          title="Loyalty Program" 
          subtitle="Build meaningful relationships with your customers and watch them return again and again!"
          showBackButton={true}
          mascotMood="happy"
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
  } else {
    // Edit mode (new implementation for EmotionalLoyaltyPrograms.tsx and Loyalty2.tsx)
    const { loyaltyProgram, loyaltyRewards, businessId, onProgramSaved, onRewardsChange, onBackClick } = props;
    
    // Implement the edit mode UI here
    // For now, let's create a placeholder UI that shows we're in edit mode
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <LoyaltyHeader 
          title={loyaltyProgram ? "Edit Loyalty Program" : "Create Loyalty Program"}
          subtitle={loyaltyProgram 
            ? "Update your loyalty program settings below" 
            : "Set up your loyalty program to reward your customers"}
          showBackButton={true}
          backUrl="/business/loyalty"
          mascotMood={loyaltyProgram ? "happy" : "neutral"}
        />

        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <p className="text-gray-600 mb-4">
            This is a placeholder for the loyalty program editor. In a real implementation, 
            this would contain form fields to edit the loyalty program.
          </p>
          
          <button
            onClick={() => {
              // Create a sample program for demonstration
              const sampleProgram: LoyaltyProgram = {
                id: loyaltyProgram?.id || `program-${Date.now()}`,
                name: "Sample Loyalty Program",
                description: "A sample loyalty program",
                businessId: businessId,
                type: 'visits', // Required property
                rewards: [], // Required property
                active: true,
                visitsRequired: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              onProgramSaved(sampleProgram);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow"
          >
            {loyaltyProgram ? "Update Program" : "Create Program"}
          </button>
        </div>
        
        {loyaltyProgram && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span>Program Rewards</span>
              <span className="ml-2 text-yellow-500">🎁</span>
            </h2>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              {loyaltyRewards.length > 0 ? (
                <div className="space-y-4">
                  {loyaltyRewards.map((reward, index) => (
                    <div 
                      key={reward.id || index} 
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <div>
                        <h3 className="font-medium">{reward.name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <div className="text-sm text-purple-600 font-medium">
                        {reward.visitsCost || reward.pointsCost || 0} {reward.visitsCost ? 'visits' : 'points'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">No rewards yet</p>
                  <p className="text-sm text-gray-500">
                    Add rewards to your loyalty program to engage customers
                  </p>
                  <button
                    onClick={() => {
                      // Add a sample reward
                      const newReward: LoyaltyReward = {
                        id: `reward-${Date.now()}`,
                        name: "Free Coffee",
                        description: "Get a free coffee after 10 visits",
                        visitsCost: 10,
                        type: 'freeItem',
                        freeItem: 'Coffee',
                        active: true
                      };
                      onRewardsChange([...loyaltyRewards, newReward]);
                    }}
                    className="mt-4 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 px-4 py-2 rounded-lg hover:from-orange-200 hover:to-yellow-200 transition-all duration-300"
                  >
                    Add Sample Reward
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
};

export default SimpleLoyalty;