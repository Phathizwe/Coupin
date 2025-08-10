import React, { useState, useEffect } from 'react';
import { Customer, LoyaltyProgram, LoyaltyReward } from '../../types';
import { getLoyaltyProgram, getLoyaltyRewards, updateCustomerLoyaltyPoints } from '../../services/loyaltyService';

interface CustomerLoyaltyCardProps {
  customer: Customer;
  onPointsUpdated: (customer: Customer) => void;
}

const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({ customer, onPointsUpdated }) => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!customer.businessId) return;
      
      try {
        setLoading(true);
        const program = await getLoyaltyProgram(customer.businessId);
        setLoyaltyProgram(program);
        
        if (program) {
          const rewards = await getLoyaltyRewards(program.id);
          setLoyaltyRewards(rewards);
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoyaltyData();
  }, [customer.businessId]);

  const handleAddPoints = async () => {
    if (!customer.id || pointsToAdd <= 0) return;
    
    try {
      setUpdating(true);
      await updateCustomerLoyaltyPoints(customer.id, pointsToAdd);
      
      // Update the customer object with new points
      const updatedCustomer = {
        ...customer,
        loyaltyPoints: (customer.loyaltyPoints || 0) + pointsToAdd
      };
      
      onPointsUpdated(updatedCustomer);
      setPointsToAdd(0);
    } catch (error) {
      console.error('Error updating loyalty points:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!loyaltyProgram) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-900">Loyalty Program</h3>
        <p className="text-gray-500 text-sm mt-1">No loyalty program available for this business.</p>
      </div>
    );
  }

  if (!loyaltyProgram.active) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-900">Loyalty Program</h3>
        <p className="text-gray-500 text-sm mt-1">Loyalty program is currently inactive.</p>
      </div>
    );
  }

  // Calculate how many rewards the customer can redeem
  const getAvailableRewards = () => {
    if (!customer.loyaltyPoints) return [];
    
    return loyaltyRewards.filter(reward => 
      reward.active && 
      ((reward.pointsCost && customer.loyaltyPoints! >= reward.pointsCost) ||
       (loyaltyProgram.type === 'visits' && reward.visitsCost && customer.totalVisits! >= reward.visitsCost))
    );
  };

  const availableRewards = getAvailableRewards();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">{loyaltyProgram.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{loyaltyProgram.description}</p>
      </div>
      
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Points</p>
            <p className="text-2xl font-bold text-primary-600">{customer.loyaltyPoints || 0}</p>
          </div>
          
          {loyaltyProgram.type === 'visits' && (
            <div>
              <p className="text-sm text-gray-500">Total Visits</p>
              <p className="text-2xl font-bold text-primary-600">{customer.totalVisits || 0}</p>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="pointsToAdd" className="block text-sm font-medium text-gray-700 mb-1">
            Add Points
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="pointsToAdd"
              value={pointsToAdd}
              onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
              min="0"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter points"
            />
            <button
              onClick={handleAddPoints}
              disabled={updating || pointsToAdd <= 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {updating ? 'Adding...' : 'Add'}
            </button>
          </div>
          {loyaltyProgram.type === 'points' && loyaltyProgram.pointsPerAmount && (
            <p className="text-xs text-gray-500 mt-1">
              {loyaltyProgram.pointsPerAmount} points = $1 spent
            </p>
          )}
        </div>
        
        {availableRewards.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Available Rewards</h4>
            <div className="space-y-2">
              {availableRewards.map(reward => (
                <div key={reward.id} className="bg-white p-2 rounded border border-gray-200 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{reward.name}</span>
                    <span className="text-primary-600">
                      {reward.pointsCost ? `${reward.pointsCost} points` : 
                       reward.visitsCost ? `${reward.visitsCost} visits` : ''}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerLoyaltyCard;