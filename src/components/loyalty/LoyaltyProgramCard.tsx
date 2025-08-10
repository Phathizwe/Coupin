import React from 'react';
import { LoyaltyProgram } from '../../types';

interface LoyaltyProgramCardProps {
  program: LoyaltyProgram;
  onEdit: () => void;
  onViewDetails: () => void;
  onManageRewards: () => void;
}

const LoyaltyProgramCard: React.FC<LoyaltyProgramCardProps> = ({
  program,
  onEdit,
  onViewDetails,
  onManageRewards
}) => {
  // Calculate total members (from the Customer collection this would be done differently)
  const getMemberCount = () => {
    return 0; // Placeholder - would need to query customers with loyalty points
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            program.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {program.active ? 'Active' : 'Draft'}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{program.type}</p>
        <p className="mt-3 text-sm text-gray-600">{program.description}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-lg font-semibold">{getMemberCount()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Program Type</p>
            <p className="text-sm capitalize">
              {program.type === 'points' && 'Points-based'}
              {program.type === 'visits' && 'Visit-based'}
              {program.type === 'tiered' && 'Tiered'}
            </p>
          </div>
        </div>
        
        {program.type === 'points' && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Points Structure</p>
            <p className="text-sm">
              {program.pointsPerAmount ? `${program.pointsPerAmount} points per $1 spent` : 'Not configured'}
            </p>
            <p className="text-sm">
              {program.amountPerPoint ? `$${program.amountPerPoint} value per point` : ''}
            </p>
          </div>
        )}
        
        {program.type === 'visits' && program.visitsRequired && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Visit Structure</p>
            <p className="text-sm">{program.visitsRequired} visits required for reward</p>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          {!program.active && (
            <button 
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
              onClick={onEdit}
            >
              Edit
            </button>
          )}
          {program.active && (
            <>
              <button 
                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                onClick={onViewDetails}
              >
                View Details
              </button>
              <button 
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                onClick={onManageRewards}
              >
                Manage Rewards
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramCard;