import React, { useState } from 'react';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import LoyaltyRewardForm from './LoyaltyRewardForm';
import LoyaltyRewardsList from './LoyaltyRewardsList';
import { addLoyaltyReward, updateLoyaltyReward } from '../../services/loyaltyService';

interface LoyaltyProgramDetailsProps {
  program: LoyaltyProgram;
  rewards: LoyaltyReward[];
  onRewardsChange: (rewards: LoyaltyReward[]) => void;
}

const LoyaltyProgramDetails: React.FC<LoyaltyProgramDetailsProps> = ({
  program,
  rewards,
  onRewardsChange
}) => {
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  const handleAddReward = async (rewardData: Omit<LoyaltyReward, 'id'>) => {
    try {
      const newReward = await addLoyaltyReward(rewardData);
      onRewardsChange([...rewards, newReward]);
      setShowRewardForm(false);
      setEditingReward(null);
    } catch (error) {
      console.error('Error adding reward:', error);
    }
  };

  const handleUpdateReward = async (rewardData: Omit<LoyaltyReward, 'id'>) => {
    if (!editingReward) return;
    
    try {
      await updateLoyaltyReward(editingReward.id, rewardData);
      
      // Update the rewards list with the updated reward
      const updatedRewards = rewards.map(reward => 
        reward.id === editingReward.id 
          ? { ...rewardData, id: editingReward.id } 
          : reward
      );
      
      onRewardsChange(updatedRewards);
      setShowRewardForm(false);
      setEditingReward(null);
    } catch (error) {
      console.error('Error updating reward:', error);
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    const updatedRewards = rewards.filter(reward => reward.id !== rewardId);
    onRewardsChange(updatedRewards);
  };

  const handleEditReward = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const handleCancelRewardForm = () => {
    setShowRewardForm(false);
    setEditingReward(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{program.name}</h2>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          program.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {program.active ? 'Active' : 'Draft'}
        </span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Program Details</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Program Type</p>
              <p className="font-medium capitalize">{program.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p>{program.description || 'No description provided'}</p>
            </div>
          </div>
          
          {program.type === 'points' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Points Per $1 Spent</p>
                <p className="font-medium">{program.pointsPerAmount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Value Per Point</p>
                <p className="font-medium">${program.amountPerPoint || 0}</p>
              </div>
            </div>
          )}
          
          {program.type === 'visits' && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Visits Required for Reward</p>
              <p className="font-medium">{program.visitsRequired || 0}</p>
            </div>
          )}
          
          {program.type === 'tiered' && program.tiers && program.tiers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Tiers</p>
              <div className="space-y-2">
                {program.tiers.map((tier, index) => (
                  <div key={tier.id || index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between">
                      <p className="font-medium">{tier.name}</p>
                      <p>{tier.threshold} points</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {tier.multiplier}x points multiplier
                    </p>
                    {tier.benefits && tier.benefits.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">Benefits:</p>
                        <ul className="text-sm list-disc list-inside">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Rewards</h3>
          <button
            onClick={() => {
              setEditingReward(null);
              setShowRewardForm(true);
            }}
            className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
          >
            Add Reward
          </button>
        </div>
        
        {showRewardForm ? (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <LoyaltyRewardForm
              programId={program.id}
              onSave={editingReward ? handleUpdateReward : handleAddReward}
              onCancel={handleCancelRewardForm}
              initialData={editingReward || undefined}
            />
          </div>
        ) : (
          <LoyaltyRewardsList
            rewards={rewards}
            onEdit={handleEditReward}
            onDelete={handleDeleteReward}
          />
        )}
      </div>
    </div>
  );
};

export default LoyaltyProgramDetails;