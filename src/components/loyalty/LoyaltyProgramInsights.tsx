import React from 'react';
import { LoyaltyProgram } from '../../types';

interface LoyaltyProgramInsightsProps {
  program: LoyaltyProgram | null;
  rewardsCount: number;
}

const LoyaltyProgramInsights: React.FC<LoyaltyProgramInsightsProps> = ({
  program,
  rewardsCount
}) => {
  // Calculate total members (from the Customer collection this would be done differently)
  const getMemberCount = () => {
    return 0; // Placeholder - would need to query customers with loyalty points
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Loyalty Program Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-3xl font-bold text-gray-900">
            {getMemberCount()}
          </p>
          <p className="text-sm text-gray-600">Start tracking member growth</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Available Rewards</p>
          <p className="text-3xl font-bold text-gray-900">{rewardsCount}</p>
          <p className="text-sm text-gray-600">
            {rewardsCount === 0 ? 'Add your first reward' : 'Rewards for your customers'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Program Type</p>
          <p className="text-3xl font-bold text-gray-900 capitalize">{program?.type || '-'}</p>
          <p className="text-sm text-gray-600">
            {program?.type === 'points' && 'Points-based rewards'}
            {program?.type === 'visits' && 'Visit-based rewards'}
            {program?.type === 'tiered' && 'Tiered loyalty system'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramInsights;