import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getLoyaltyProgram } from '../../services/loyalty/programService';
import { LoyaltyProgram } from '../../types';

const LoyaltyDashboardTile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoyaltyProgram = async () => {
      if (!user?.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loyaltyProgram = await getLoyaltyProgram(user.businessId);
        setProgram(loyaltyProgram);
      } catch (err) {
        console.error('Error loading loyalty program:', err);
        setError("Could not load loyalty program data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyProgram();
  }, [user?.businessId]);

  const handleClick = () => {
    navigate('/business/loyalty');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
        <div className="h-5 bg-amber-100 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-amber-50 rounded mb-3"></div>
        <div className="h-8 bg-amber-100 rounded-lg w-full"></div>
      </div>
    );
  }

  if (program) {
    // Display existing loyalty program
    const memberCount = 0; // This would be dynamic in a real implementation
    const rewardsCount = program.rewards?.length || 0;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-amber-900">Loyalty Program</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            program.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {program.active ? 'Active' : 'Draft'}
          </span>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-800">{program.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
        </div>
        
        <div className="flex justify-between text-sm mb-4">
          <div className="text-gray-700">
            <span className="font-semibold">{memberCount}</span> members
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">{rewardsCount}</span> rewards
          </div>
        </div>
        
        <button
          onClick={handleClick}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Manage Program
        </button>
      </div>
    );
  }

  // Display create loyalty program prompt
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 transform translate-y-0 opacity-100 transition-all duration-500 ease-out animate-slideUp">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-amber-900">Loyalty Program</h2>
      </div>
      
      <button
        onClick={handleClick}
        className="w-full flex flex-col items-center justify-center py-6 text-center rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors shadow-sm animate-scaleIn focus:outline-none focus:ring-2 focus:ring-purple-300"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mb-3 shadow-md">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-purple-900 font-semibold mb-1">Create Loyalty Program</p>
        <p className="text-sm text-purple-700">Keep customers coming back with rewards</p>
      </button>
    </div>
  );
};

export default LoyaltyDashboardTile;