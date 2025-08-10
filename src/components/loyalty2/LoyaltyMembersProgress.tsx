import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Customer, LoyaltyProgram } from '../../types';
import { getLoyaltyProgram } from '../../services/loyalty/programService';
import { CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

interface LoyaltyMemberWithProgress extends Customer {
  progress: number; // Percentage of progress to next reward
  visitsOrPoints: number; // Current visits or points
  nextRewardAt: number; // Points or visits needed for next reward
}

const LoyaltyMembersProgress: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [members, setMembers] = useState<LoyaltyMemberWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);

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
        let q;
        
        if (program.type === 'points') {
          q = query(
            customersRef,
            where('businessId', '==', businessId),
            where('loyaltyPoints', '>', 0),
            orderBy('loyaltyPoints', 'desc'),
            limit(5)
          );
        } else if (program.type === 'visits') {
          q = query(
            customersRef,
            where('businessId', '==', businessId),
            where('totalVisits', '>', 0),
            orderBy('totalVisits', 'desc'),
            limit(5)
          );
        } else {
          q = query(
            customersRef,
            where('businessId', '==', businessId),
            where('loyaltyPoints', '>', 0),
            orderBy('loyaltyPoints', 'desc'),
            limit(5)
          );
        }
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setMembers([]);
          setLoading(false);
          return;
        }
        
        const loyaltyMembers: LoyaltyMemberWithProgress[] = [];
        
        snapshot.forEach(doc => {
          const customer = { id: doc.id, ...doc.data() } as Customer;
          
          let progress = 0;
          let nextRewardAt = 0;
          let visitsOrPoints = 0;
          
          if (program.type === 'points') {
            visitsOrPoints = customer.loyaltyPoints || 0;
            
            // Find the next reward they can get
            const sortedRewards = [...program.rewards]
              .filter(r => r.active && r.pointsCost)
              .sort((a, b) => (a.pointsCost || 0) - (b.pointsCost || 0));
            
            const nextReward = sortedRewards.find(r => (r.pointsCost || 0) > visitsOrPoints);
            
            if (nextReward) {
              nextRewardAt = nextReward.pointsCost || 0;
              progress = (visitsOrPoints / nextRewardAt) * 100;
            } else if (sortedRewards.length > 0) {
              // If they have enough for all rewards, show progress to the highest one
              const highestReward = sortedRewards[sortedRewards.length - 1];
              nextRewardAt = highestReward.pointsCost || 0;
              progress = 100; // They've reached the top reward
            }
          } else if (program.type === 'visits') {
            visitsOrPoints = customer.totalVisits || 0;
            nextRewardAt = program.visitsRequired || 10;
            
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
              const pointsToNextTier = nextRewardAt - prevThreshold;
              const pointsEarned = visitsOrPoints - prevThreshold;
              progress = (pointsEarned / pointsToNextTier) * 100;
            } else if (sortedTiers.length > 0) {
              // They're at the highest tier
              nextRewardAt = sortedTiers[sortedTiers.length - 1].threshold;
              progress = 100;
            }
          }
          
          loyaltyMembers.push({
            ...customer,
            progress,
            visitsOrPoints,
            nextRewardAt
          });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-4">
          <p className="text-gray-500">No loyalty program found</p>
          <Link 
            to="/business/loyalty" 
            className="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            Create a loyalty program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Loyalty Program Members</h3>
        <Link 
          to="/business/loyalty" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </Link>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No members in your loyalty program yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
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
                      {member.visitsOrPoints} {program.type === 'points' ? 'points' : program.type === 'visits' ? 'visits' : 'points'}
                    </div>
                  </div>
                </div>
                <div className="w-1/3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(member.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right text-gray-500 mt-1">
                    {Math.round(member.progress)}% to next reward
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LoyaltyMembersProgress;