import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import {
  getLoyaltyProgram,
  getLoyaltyRewards,
  getLoyaltyProgramStats,
  checkAndUpdateAchievements,
  initializeLoyaltyProgram
} from '../../services/loyaltyService';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import DetailedLoyalty from '../../components/loyalty2/DetailedLoyalty';
import SimpleLoyalty from '../../components/loyalty2/SimpleLoyalty';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const Loyalty2: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

  const [loading, setLoading] = useState(true);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch loyalty program data
  useEffect(() => {
    const fetchLoyaltyProgram = async () => {
      // Get the business ID from either the user or the business profile
      const businessId = user?.businessId || businessProfile?.businessId;
      
      // Enhanced validation to prevent undefined businessId issues
      if (!businessId || businessId === 'undefined' || businessId === 'null') {
        console.log('Skipping loyalty program fetch - invalid businessId:', businessId);
        setError('Unable to determine your business ID. Please refresh or contact support.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching loyalty program for businessId:', businessId);

        // First try to get an existing program
        let program = await getLoyaltyProgram(businessId);
        console.log('🔍 DEBUG: getLoyaltyProgram returned:', program);
        // If no program exists, initialize one
        if (!program) {
          console.log('No loyalty program found, initializing a new one...');
          try {
            program = await initializeLoyaltyProgram(businessId);
            console.log('🔍 DEBUG: initializeLoyaltyProgram returned:', program);
            if (!program) {
              throw new Error('Failed to initialize loyalty program');
            }
          } catch (initError) {
            console.error('Error initializing loyalty program:', initError);
            setError('Failed to create a loyalty program. Please try again or contact support.');
        setLoading(false);
            return;
      }
        } else {
          console.log('🔍 DEBUG: Found existing program, skipping initialization');
        }

        setLoyaltyProgram(program);

        if (program) {
    try {
            const rewards = await getLoyaltyRewards(program.id);
            setLoyaltyRewards(rewards);
          } catch (rewardsError) {
            console.warn('Error fetching rewards:', rewardsError);
            // Continue with empty rewards
            setLoyaltyRewards([]);
          }

          try {
            // Fetch stats and update achievements
            const stats = await getLoyaltyProgramStats(program.businessId, program.id);
            await checkAndUpdateAchievements(program.businessId, program.id, stats);
          } catch (statsError) {
            console.warn('Error getting stats or updating achievements:', statsError);
            // Continue anyway since this is not critical
          }
        }
    } catch (error) {
        console.error('Error fetching loyalty program:', error);
        setError('Failed to load loyalty program data. Please try again.');
      } finally {
        setLoading(false);
    }
  };

    fetchLoyaltyProgram();
  }, [user, businessProfile]);

  // Handle program creation or update
  const handleProgramSaved = async (updatedProgram: LoyaltyProgram) => {
    try {
      console.log('🚀 Saving program to Firestore:', updatedProgram);

      // Import the saveLoyaltyProgram function
      const { saveLoyaltyProgram } = await import('../../services/loyaltyService');

      // Save the program to Firestore
      const savedProgram = await saveLoyaltyProgram(updatedProgram);
      console.log('✅ Program saved successfully:', savedProgram);

      // Update local state with the saved program
      setLoyaltyProgram(savedProgram);
      setShowCelebration(true);
      toast.success('Loyalty program saved successfully!');

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error saving program:', error);
      setError('Failed to save loyalty program. Please try again.');
      toast.error('Failed to save loyalty program');
    }
  };

  // Handle rewards changes
  const handleRewardsChange = (updatedRewards: LoyaltyReward[]) => {
    setLoyaltyRewards(updatedRewards);
};

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner />
        <p className="mt-4 text-purple-600 animate-pulse">Loading your loyalty program experience...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the business ID for passing to components
  const effectiveBusinessId = user?.businessId || businessProfile?.businessId || '';

  // Render based on view mode
  if (viewMode === 'simple') {
    // For simple mode, we need to check if we have a program and use ViewProps pattern
    if (loyaltyProgram) {
      return (
        <SimpleLoyalty
          program={loyaltyProgram}
          onInviteMember={() => {
            // Handle invite member action
            console.log('Invite member action triggered');
          }}
          onScanQR={() => {
            // Handle scan QR action  
            console.log('Scan QR action triggered');
          }}
          onReward={() => {
            // Handle reward action
            console.log('Reward action triggered');
          }}
        />
      );
    } else {
      // No program exists, show simple creation interface
      return (
        <SimpleLoyalty
          loyaltyProgram={loyaltyProgram}
          loyaltyRewards={loyaltyRewards}
          businessId={effectiveBusinessId}
          onProgramSaved={handleProgramSaved}
          onRewardsChange={handleRewardsChange}
          onBackClick={() => navigate('/business/dashboard')}
        />
      );
    }
  }

  // Default detailed view
  return (
    <DetailedLoyalty
      loyaltyProgram={loyaltyProgram}
      loyaltyRewards={loyaltyRewards}
      businessId={effectiveBusinessId}
      onProgramSaved={handleProgramSaved}
      onRewardsChange={handleRewardsChange}
      showCelebration={showCelebration}
      onBackClick={() => navigate('/business/dashboard')}
    />
  );
};

export default Loyalty2;