import React from 'react';
import { LoyaltyProgram } from '../../../types';

interface RewardsCelebrationProps {
  program: LoyaltyProgram;
}

const RewardsCelebration: React.FC<RewardsCelebrationProps> = ({ program }) => {
  const hasRewards = program.rewards && program.rewards.length > 0;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span>Celebration Rewards</span>
        <span className="ml-2 text-yellow-500">🎁</span>
      </h2>
      
      {hasRewards ? (
        <div className="space-y-4">
          {program.rewards.map((reward) => (
            <div 
              key={reward.id} 
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-indigo-400"
            >
              <h3 className="font-medium text-gray-800 mb-1">{reward.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-indigo-600 font-medium">
                  {reward.visitsCost ? `${reward.visitsCost} visits` : reward.pointsCost ? `${reward.pointsCost} points` : 'Special reward'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reward.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {reward.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-2">Ready to create memorable moments?</p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Add rewards to your loyalty program to delight your customers and create lasting connections
          </p>
        </div>
      )}
    </div>
  );
};

export default RewardsCelebration;