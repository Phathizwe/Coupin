import React, { useState, useEffect } from 'react';
import { Customer, LoyaltyProgram, LoyaltyReward, LoyaltyTier } from '../../types';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { updateCustomerLoyaltyPoints } from '../../services/loyalty/customerLoyaltyService';
import { toast } from 'react-toastify';

interface LoyaltyRewardModalProps {
  program: LoyaltyProgram;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal component for rewarding customers who have reached the qualification threshold
 */
const LoyaltyRewardModal: React.FC<LoyaltyRewardModalProps> = ({
  program,
  onClose,
  onSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [availableRewards, setAvailableRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nextRewardName, setNextRewardName] = useState('');

  // Search for customers
  const searchCustomers = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setErrorMessage('Please enter at least 2 characters to search');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const customersRef = collection(db, 'customers');
      const searchTermLower = searchTerm.toLowerCase();
      
      // We'll search by phone number if the search term contains only numbers
      if (/^\d+$/.test(searchTerm)) {
        const q = query(
          customersRef,
          where('businessId', '==', program.businessId),
          where('phone', '>=', searchTerm),
          where('phone', '<=', searchTerm + '\uf8ff')
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedCustomers: Customer[] = [];
          snapshot.forEach(doc => {
            fetchedCustomers.push({ id: doc.id, ...doc.data() } as Customer);
          });
          setCustomers(fetchedCustomers);
        } else {
          setCustomers([]);
          setErrorMessage('No customers found with that phone number');
        }
      } else {
        // For text search, we'll fetch all customers and filter client-side
        const q = query(
          customersRef,
          where('businessId', '==', program.businessId)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const fetchedCustomers: Customer[] = [];
          snapshot.forEach(doc => {
            const customer = { id: doc.id, ...doc.data() } as Customer;
            const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
            const email = (customer.email || '').toLowerCase();
            
            if (fullName.includes(searchTermLower) || email.includes(searchTermLower)) {
              fetchedCustomers.push(customer);
            }
          });
          
          setCustomers(fetchedCustomers);
          
          if (fetchedCustomers.length === 0) {
            setErrorMessage('No customers found matching your search');
          }
        } else {
          setCustomers([]);
          setErrorMessage('No customers found for this business');
        }
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setErrorMessage('An error occurred while searching for customers');
    } finally {
      setIsLoading(false);
    }
  };

  // Check which rewards the customer is eligible for
  useEffect(() => {
    if (!selectedCustomer || !program.rewards) return;
    
    const eligible: LoyaltyReward[] = [];
    
    if (program.type === 'points') {
      const customerPoints = selectedCustomer.loyaltyPoints || 0;
      
      // Find the next reward they can get
      const sortedRewards = [...program.rewards]
        .filter(r => r.active && r.pointsCost)
        .sort((a, b) => (a.pointsCost || 0) - (b.pointsCost || 0));
      
      const nextReward = sortedRewards.find(r => (r.pointsCost || 0) > customerPoints);
      
      if (nextReward) {
        setNextRewardName(nextReward.name);
      }
      
      // Filter rewards that the customer has enough points for
      program.rewards.forEach(reward => {
        if (reward.active && reward.pointsCost && customerPoints >= reward.pointsCost) {
          eligible.push(reward);
        }
      });
    } else if (program.type === 'visits') {
      const customerVisits = selectedCustomer.totalVisits || 0;
      const visitsRequired = program.visitsRequired || 10;
      
      // Find the reward for completing visits
      const visitReward = program.rewards.find(r => r.active && r.visitsCost === visitsRequired);
      if (visitReward) {
        setNextRewardName(visitReward.name);
      }
      
      // Check if customer has completed enough visits for a reward
      if (customerVisits >= visitsRequired && customerVisits % visitsRequired === 0) {
        // Find rewards for visit-based program
        program.rewards.forEach(reward => {
          if (reward.active && reward.visitsCost) {
            eligible.push(reward);
          }
        });
      }
    } else if (program.type === 'tiered') {
      const customerPoints = selectedCustomer.loyaltyPoints || 0;
      
      // Determine customer's current tier
      let currentTier: LoyaltyTier | null = null;
      if (program.tiers) {
        const sortedTiers = [...program.tiers].sort((a, b) => a.threshold - b.threshold);
        
        for (const tier of sortedTiers) {
          if (customerPoints >= tier.threshold) {
            currentTier = tier;
          } else {
            // Set the next tier name
            setNextRewardName(`${tier.name} Tier`);
            break;
          }
        }
      }
      
      // Filter rewards that the customer's tier qualifies for
      if (currentTier) {
        program.rewards.forEach(reward => {
          if (reward.active && (!reward.tierRequired || reward.tierRequired === currentTier?.id)) {
            eligible.push(reward);
          }
        });
      }
    }
    
    setAvailableRewards(eligible);
    
    if (eligible.length === 0) {
      if (nextRewardName) {
        setErrorMessage(`This customer is not yet eligible for the reward of ${nextRewardName}`);
      } else {
        setErrorMessage('This customer is not yet eligible for any rewards');
      }
    }
  }, [selectedCustomer, program]);

  // Process the reward redemption
  const processReward = async () => {
    if (!selectedCustomer || !selectedReward) {
      setErrorMessage('Please select both a customer and a reward');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Record the redemption
      const redemptionsRef = collection(db, 'reward_redemptions');
      
      await addDoc(redemptionsRef, {
        customerId: selectedCustomer.id,
        rewardId: selectedReward.id,
        programId: program.id,
        businessId: program.businessId,
        redeemedAt: Timestamp.now()
      });
      
      // Deduct points if it's a points-based program
      if (program.type === 'points' && selectedReward.pointsCost) {
        await updateCustomerLoyaltyPoints(selectedCustomer.id, -selectedReward.pointsCost);
      }
      
      // Reset visit counter if it's a visit-based program
      if (program.type === 'visits' && selectedReward.visitsCost) {
        const customerRef = doc(db, 'customers', selectedCustomer.id);
        const customerDoc = await getDoc(customerRef);
        
        if (customerDoc.exists()) {
          const currentVisits = customerDoc.data().totalVisits || 0;
          const visitsRequired = program.visitsRequired || 10;
          
          // Reset to the remainder after completing a cycle
          const newVisits = currentVisits % visitsRequired;
          
          await updateDoc(customerRef, {
            totalVisits: newVisits,
            updatedAt: Timestamp.now()
          });
        }
      }
      
      toast.success(`Reward redeemed for ${selectedCustomer.firstName}!`);
      onSuccess();
    } catch (error) {
      console.error('Error processing reward:', error);
      setErrorMessage('Failed to process reward');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Redeem Customer Reward</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Customer search section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Find Customer
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, email or phone"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={searchCustomers}
              disabled={isLoading || searchTerm.length < 2}
              className={`px-4 py-2 rounded-md font-medium ${
                isLoading || searchTerm.length < 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {/* Customer results */}
        {customers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select a Customer
            </h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {customers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-800">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {program.type === 'points' && `Points: ${customer.loyaltyPoints || 0}`}
                    {program.type === 'visits' && `Visits: ${customer.totalVisits || 0}`}
                    {program.type === 'tiered' && `Points: ${customer.loyaltyPoints || 0}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Available rewards section */}
        {selectedCustomer && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Available Rewards
            </h3>
            {availableRewards.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {availableRewards.map(reward => (
                  <div
                    key={reward.id}
                    onClick={() => setSelectedReward(reward)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedReward?.id === reward.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-800">
                      {reward.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reward.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {reward.type === 'discount' && 
                        `${reward.discountType === 'percentage' ? reward.discountValue + '%' : '$' + reward.discountValue} off`}
                      {reward.type === 'freeItem' && `Free ${reward.freeItem}`}
                      {reward.type === 'custom' && reward.customDescription}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">
                  {selectedCustomer && nextRewardName ? 
                    `This customer is not yet eligible for the reward of ${nextRewardName}` : 
                    'Select a customer to see available rewards'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={processReward}
            disabled={isProcessing || !selectedCustomer || !selectedReward}
            className={`px-4 py-2 rounded-md font-medium ${
              isProcessing || !selectedCustomer || !selectedReward
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Redeem Reward'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyRewardModal;