import React from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';

interface LoyaltyRewardsListProps {
  rewards: LoyaltyReward[];
  program: LoyaltyProgram;
  onRewardsChange: (rewards: LoyaltyReward[]) => void;
}

const LoyaltyRewardsList: React.FC<LoyaltyRewardsListProps> = ({ 
  rewards, 
  program,
  onRewardsChange 
}) => {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-6 bg-purple-50 rounded-xl">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🎁</span>
        </div>
        <p className="text-purple-800 font-medium mb-1">No rewards yet</p>
        <p className="text-sm text-purple-600">
          Add rewards to your loyalty program to engage customers
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {rewards.map((reward) => (
        <div 
          key={reward.id}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              {reward.type === 'discount' ? '💰' : 
               reward.type === 'freeItem' ? '🎁' : '✨'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800">{reward.name}</h3>
              <p className="text-xs text-purple-600 mt-1">{reward.description}</p>
              
              <div className="mt-2 flex items-center">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {program.type === 'points' && reward.pointsCost ? 
                    `${reward.pointsCost} points` : 
                    program.type === 'visits' && reward.visitsCost ? 
                    `${reward.visitsCost} visits` : 
                    reward.tierRequired ? 
                    `${reward.tierRequired} tier` : 
                    'Custom reward'}
                </span>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  reward.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {reward.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoyaltyRewardsList;