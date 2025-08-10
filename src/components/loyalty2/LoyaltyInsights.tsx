import React, { useState, useEffect } from 'react';
import { LoyaltyProgram } from '../../types';
import { getLoyaltyProgramStats, LoyaltyProgramStats } from '../../services/loyaltyService';

interface LoyaltyInsightsProps {
  program: LoyaltyProgram | null;
  rewardsCount: number;
}

const LoyaltyInsights: React.FC<LoyaltyInsightsProps> = ({ program, rewardsCount }) => {
  const [stats, setStats] = useState<LoyaltyProgramStats>({
    memberCount: 0,
    redemptionRate: 0,
    averageSpend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!program || !program.id || !program.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const programStats = await getLoyaltyProgramStats(program.businessId, program.id);
        setStats(programStats);
      } catch (error) {
        console.error('Error fetching loyalty program stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [program]);

  if (!program) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
      <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Program Insights
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-3 text-center hover:bg-purple-100 transition-colors">
          <p className="text-sm text-purple-600">Members</p>
          {loading ? (
            <div className="animate-pulse h-8 bg-purple-200 rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-purple-800">{stats.memberCount}</p>
          )}
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-3 text-center hover:bg-indigo-100 transition-colors">
          <p className="text-sm text-indigo-600">Rewards</p>
          <p className="text-2xl font-bold text-indigo-800">{rewardsCount}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors">
          <p className="text-sm text-blue-600">Redemption</p>
          {loading ? (
            <div className="animate-pulse h-8 bg-blue-200 rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-blue-800">{stats.redemptionRate}%</p>
          )}
        </div>
        
        <div className="bg-violet-50 rounded-lg p-3 text-center hover:bg-violet-100 transition-colors">
          <p className="text-sm text-violet-600">Avg. Spend</p>
          {loading ? (
            <div className="animate-pulse h-8 bg-violet-200 rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-violet-800">R{stats.averageSpend}</p>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
        <h3 className="font-medium text-purple-800 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Program Impact
        </h3>
        <p className="text-sm text-purple-700">
          Members of your loyalty program spend <span className="font-bold">2.5x more</span> than non-members. 
          Keep enhancing your program to increase customer retention!
        </p>
      </div>
    </div>
  );
};

export default LoyaltyInsights;