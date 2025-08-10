import React, { useState, useEffect } from 'react';
import { LoyaltyProgram } from '../../types';
import { getLoyaltyProgramStats } from '../../services/loyaltyService';

interface LoyaltyProgressCardProps {
  program: LoyaltyProgram;
}

const LoyaltyProgressCard: React.FC<LoyaltyProgressCardProps> = ({ program }) => {
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const targetCount = 200;
  const progress = Math.min(100, Math.round((memberCount / targetCount) * 100));
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get the actual member count from the loyalty program stats
        const stats = await getLoyaltyProgramStats(program.businessId, program.id);
        setMemberCount(stats?.memberCount || 0);
      } catch (error) {
        console.error('Error fetching loyalty program stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [program.businessId, program.id]);
  
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">{program.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          program.active ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
        }`}>
          {program.active ? 'Active' : 'Draft'}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white mb-1">
          <span>Program Growth</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <div className="text-white">
          {loading ? (
            <span className="opacity-70">Loading...</span>
          ) : (
            <><span className="font-semibold">{memberCount}</span> members</>
          )}
        </div>
        <div className="text-white">
          <span className="font-semibold">{program.rewards?.length || 0}</span> rewards
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgressCard;