import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyProgram } from '../../types';

interface LoyaltyProgramStatsProps {
  businessId: string;
  program: LoyaltyProgram;
}

interface ProgramStats {
  memberCount: number;
  redemptionCount: number;
  redemptionRate: number;
  averageSpend: number;
}

const LoyaltyProgramStats: React.FC<LoyaltyProgramStatsProps> = ({ 
  businessId, 
  program 
}) => {
  const [stats, setStats] = useState<ProgramStats>({
    memberCount: 0,
    redemptionCount: 0,
    redemptionRate: 0,
    averageSpend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramStats = async () => {
      if (!businessId || !program?.id) return;
      
      try {
        setLoading(true);
        
        // Get member count - customers with this loyalty program ID
        const customersRef = collection(db, 'customers');
        const membersQuery = query(
          customersRef,
          where('businessId', '==', businessId),
          where('loyaltyProgramId', '==', program.id)
        );
        
        const membersSnapshot = await getDocs(membersQuery);
        const memberCount = membersSnapshot.size;
        
        // Get redemption data
        const redemptionsRef = collection(db, 'loyaltyRedemptions');
        const redemptionsQuery = query(
          redemptionsRef,
          where('businessId', '==', businessId),
          where('programId', '==', program.id)
        );
        
        const redemptionsSnapshot = await getDocs(redemptionsQuery);
        const redemptionCount = redemptionsSnapshot.size;
        
        // Calculate redemption rate
        const redemptionRate = memberCount > 0 ? (redemptionCount / memberCount) * 100 : 0;
        
        // Calculate average spend (if available)
        let totalSpend = 0;
        let customersWithSpend = 0;
        
        membersSnapshot.forEach(doc => {
          const customerData = doc.data();
          if (customerData.totalSpent && typeof customerData.totalSpent === 'number') {
            totalSpend += customerData.totalSpent;
            customersWithSpend++;
          }
        });
        
        const averageSpend = customersWithSpend > 0 ? totalSpend / customersWithSpend : 0;
        
        setStats({
          memberCount,
          redemptionCount,
          redemptionRate,
          averageSpend
        });
      } catch (error) {
        console.error('Error fetching program stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgramStats();
  }, [businessId, program]);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Members</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.memberCount}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Rewards</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">{program.rewards.length}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Redemption Rate</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.redemptionRate.toFixed(1)}%</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Spend</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">
          ${stats.averageSpend.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default LoyaltyProgramStats;