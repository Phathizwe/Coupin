import React, { useState } from 'react';
import { LoyaltyReward } from '../../types';
import { deleteLoyaltyReward } from '../../services/loyaltyService';

interface LoyaltyRewardsListProps {
  rewards: LoyaltyReward[];
  onEdit: (reward: LoyaltyReward) => void;
  onDelete: (rewardId: string) => void;
}

const LoyaltyRewardsList: React.FC<LoyaltyRewardsListProps> = ({
  rewards,
  onEdit,
  onDelete
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (rewardId: string) => {
    setLoading(true);
    try {
      await deleteLoyaltyReward(rewardId);
      onDelete(rewardId);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting reward:', error);
    } finally {
      setLoading(false);
    }
  };

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No rewards added yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Add rewards to your loyalty program to encourage customer participation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Program Rewards</h3>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Reward
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Cost
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rewards.map((reward) => (
              <tr key={reward.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <div className="font-medium text-gray-900">{reward.name}</div>
                  <div className="text-gray-500">{reward.description}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {reward.type === 'discount' && (
                    <span>
                      {reward.discountType === 'percentage' 
                        ? `${reward.discountValue}% off` 
                        : `$${reward.discountValue} off`}
                    </span>
                  )}
                  {reward.type === 'freeItem' && <span>{reward.freeItem}</span>}
                  {reward.type === 'custom' && <span>{reward.customDescription}</span>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {reward.pointsCost && <div>{reward.pointsCost} points</div>}
                  {reward.visitsCost && <div>{reward.visitsCost} visits</div>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    reward.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reward.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                  {confirmDelete === reward.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(reward.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900"
                      >
                        {loading ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onEdit(reward)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(reward.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoyaltyRewardsList;