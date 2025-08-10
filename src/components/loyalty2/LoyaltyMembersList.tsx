import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Customer, LoyaltyProgram } from '../../types';
import { getLoyaltyProgram } from '../../services/loyalty/programService';
import { CircularProgress, LinearProgress } from '@mui/material';

interface LoyaltyMemberWithProgress extends Customer {
  progress: number; // Percentage of progress to next reward
  visitsOrPoints: number; // Current visits or points
  nextRewardAt: number; // Points or visits needed for next reward
  nextRewardName?: string; // Name of the next reward they're working toward
}

const LoyaltyMembersList: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [members, setMembers] = useState<LoyaltyMemberWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLoyaltyProgram = async () => {
      if (!user?.businessId && !businessProfile?.businessId) return;
      
      try {
        const businessId = user?.businessId || businessProfile?.businessId;
        const loyaltyProgram = await getLoyaltyProgram(businessId!);
        setProgram(loyaltyProgram);
      } catch (error) {
        console.error('Error fetching loyalty program:', error);
      }
    };
    
    fetchLoyaltyProgram();
  }, [user, businessProfile]);

  useEffect(() => {
    const fetchLoyaltyMembers = async () => {
      if (!user?.businessId && !businessProfile?.businessId) return;
      if (!program) return;
      
      try {
        const businessId = user?.businessId || businessProfile?.businessId;
        
        // Query customers with loyalty points or visits
        const customersRef = collection(db, 'customers');
        const q = query(
          customersRef,
          where('businessId', '==', businessId),
          orderBy('lastName')
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setMembers([]);
          setLoading(false);
          return;
        }
        
        const loyaltyMembers: LoyaltyMemberWithProgress[] = [];
        
        snapshot.forEach(doc => {
          const customer = { id: doc.id, ...doc.data() } as Customer;
          
          // Only include customers who have loyalty activity
          if (customer.loyaltyPoints || customer.totalVisits) {
            let progress = 0;
            let nextRewardAt = 0;
            let visitsOrPoints = 0;
            let nextRewardName = '';
            
            if (program.type === 'points') {
              visitsOrPoints = customer.loyaltyPoints || 0;
              
              // Find the next reward they can get
              const sortedRewards = [...program.rewards]
                .filter(r => r.active && r.pointsCost)
                .sort((a, b) => (a.pointsCost || 0) - (b.pointsCost || 0));
              
              const nextReward = sortedRewards.find(r => (r.pointsCost || 0) > visitsOrPoints);
              
              if (nextReward) {
                nextRewardAt = nextReward.pointsCost || 0;
                nextRewardName = nextReward.name;
                progress = (visitsOrPoints / nextRewardAt) * 100;
              } else if (sortedRewards.length > 0) {
                // If they have enough for all rewards, show progress to the highest one
                const highestReward = sortedRewards[sortedRewards.length - 1];
                nextRewardAt = highestReward.pointsCost || 0;
                nextRewardName = highestReward.name;
                progress = 100; // They've reached the top reward
              }
            } else if (program.type === 'visits') {
              visitsOrPoints = customer.totalVisits || 0;
              nextRewardAt = program.visitsRequired || 10;
              
              // Find the reward for completing visits
              const visitReward = program.rewards.find(r => r.visitsCost === program.visitsRequired);
              if (visitReward) {
                nextRewardName = visitReward.name;
              }
              
              // Calculate progress as a percentage of required visits
              progress = ((visitsOrPoints % nextRewardAt) / nextRewardAt) * 100;
            } else if (program.type === 'tiered') {
              visitsOrPoints = customer.loyaltyPoints || 0;
              
              // Sort tiers by threshold
              const sortedTiers = [...program.tiers || []]
                .sort((a, b) => a.threshold - b.threshold);
              
              // Find the next tier they can reach
              const currentTierIndex = sortedTiers.findIndex(
                tier => visitsOrPoints < tier.threshold
              ) - 1;
              
              const currentTier = currentTierIndex >= 0 ? sortedTiers[currentTierIndex] : null;
              const nextTier = currentTierIndex + 1 < sortedTiers.length ? 
                sortedTiers[currentTierIndex + 1] : null;
              
              if (nextTier) {
                const prevThreshold = currentTier ? currentTier.threshold : 0;
                nextRewardAt = nextTier.threshold;
                nextRewardName = nextTier.name + ' Tier';
                const pointsToNextTier = nextRewardAt - prevThreshold;
                const pointsEarned = visitsOrPoints - prevThreshold;
                progress = (pointsEarned / pointsToNextTier) * 100;
              } else if (sortedTiers.length > 0) {
                // They're at the highest tier
                nextRewardAt = sortedTiers[sortedTiers.length - 1].threshold;
                nextRewardName = 'Highest Tier Achieved';
                progress = 100;
              }
            }
            
            loyaltyMembers.push({
              ...customer,
              progress,
              visitsOrPoints,
              nextRewardAt,
              nextRewardName
            });
          }
        });
        
        setMembers(loyaltyMembers);
      } catch (error) {
        console.error('Error fetching loyalty members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (program) {
      fetchLoyaltyMembers();
    }
  }, [user, businessProfile, program]);

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (member.phone && member.phone.includes(searchTerm));
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No loyalty program found. Please create a loyalty program first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Loyalty Program Members</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            className="border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="w-5 h-5 text-gray-400 absolute left-3 top-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No loyalty members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Start by adding customers to your loyalty program'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {program.type === 'points' ? 'Points' : program.type === 'visits' ? 'Visits' : 'Tier Progress'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress to Next Reward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Reward
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-500">
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.visitsOrPoints} {program.type === 'points' ? 'points' : program.type === 'visits' ? 'visits' : 'points'}
                    </div>
                    {program.type === 'tiered' && (
                      <div className="text-xs text-gray-500">
                        Next tier at: {member.nextRewardAt} points
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(member.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(member.progress)}% complete
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.nextRewardName || 'No reward available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoyaltyMembersList;