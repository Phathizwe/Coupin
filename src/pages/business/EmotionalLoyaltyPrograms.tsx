import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import {
  getLoyaltyProgram,
  getLoyaltyRewards,
  saveLoyaltyProgram
} from '../../services/loyaltyService';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import DetailedLoyalty from '../../components/loyalty2/DetailedLoyalty';
import SimpleLoyalty from '../../components/loyalty2/SimpleLoyalty';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmergencyLoyaltyFix from '../../components/loyalty/EmergencyLoyaltyFix';
import { toast } from 'react-toastify';

const EmotionalLoyaltyPrograms: React.FC = () => {
  // Get viewMode from context with a fallback to prevent errors
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';
  const navigate = useNavigate();

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  // Fetch loyalty program data
  useEffect(() => {
    const fetchLoyaltyProgram = async () => {
      if (!user?.businessId) return;

      try {
        setLoading(true);
        const program = await getLoyaltyProgram(user.businessId);
        setLoyaltyProgram(program);

        if (program) {
          const rewards = await getLoyaltyRewards(program.id);
          setLoyaltyRewards(rewards);
        }
    } catch (error) {
        console.error('Error fetching loyalty program:', error);
        toast.error('Failed to load loyalty program. Please try again.');
    } finally {
        setLoading(false);
    }
  };

    fetchLoyaltyProgram();
  }, [user]);

  // Handle program creation or update with celebration
  const handleProgramSaved = async (programData: LoyaltyProgram) => {
    if (!user?.businessId) {
      toast.error("Missing business ID. Please refresh the page or contact support.");
      return;
    }
    
    try {
      setSavingProgram(true);
      console.log('Saving loyalty program with data:', programData);
      
      // Create a clean program object without undefined values
      const programToSave: Partial<LoyaltyProgram> = {};
      
      // Only include defined values
      Object.entries(programData).forEach(([key, value]) => {
        if (value !== undefined) {
          // @ts-ignore - Dynamic property assignment
          programToSave[key] = value;
        }
      });
      
      // Ensure the program has the correct businessId
      programToSave.businessId = user.businessId;
      
      // Save to database using the service function
      const savedProgram = await saveLoyaltyProgram(programToSave);
      console.log('Loyalty program saved successfully:', savedProgram);
      
      // Update state with the saved program
      setLoyaltyProgram(savedProgram);
      
      // Show celebration
      setShowCelebration(true);
      toast.success('Loyalty program saved successfully!');
      
      // Hide celebration after delay
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      // Refresh the page after successful save to ensure everything is in sync
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } catch (error) {
      console.error('Error saving loyalty program:', error);
      let errorMessage = 'Failed to save loyalty program. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSavingProgram(false);
    }
};

  // Handle rewards changes
  const handleRewardsChange = (updatedRewards: LoyaltyReward[]) => {
    setLoyaltyRewards(updatedRewards);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/business/dashboard');
  };

  // Show loading spinner
  if (loading || savingProgram) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-3 text-purple-600 animate-pulse">
          {loading ? 'Loading your loyalty program...' : 'Saving your loyalty program...'}
        </p>
      </div>
    );
  }

  // Show emergency fix if no program exists
  if (!loyaltyProgram) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          {/* Remove ViewToggle from here */}
        </div>
        <p className="text-gray-600 mb-8">
          It looks like you don't have a loyalty program set up yet or there might be an issue with your existing program.
        </p>
        <EmergencyLoyaltyFix />
        
        {viewMode === 'simple' ? (
          <SimpleLoyalty
            loyaltyProgram={null}
            loyaltyRewards={[]}
            businessId={user?.businessId || ''}
            onProgramSaved={handleProgramSaved}
            onRewardsChange={handleRewardsChange}
            onBackClick={handleBackClick}
          />
        ) : (
          <DetailedLoyalty
            loyaltyProgram={null}
            loyaltyRewards={[]}
            businessId={user?.businessId || ''}
            onProgramSaved={handleProgramSaved}
            onRewardsChange={handleRewardsChange}
            showCelebration={showCelebration}
            onBackClick={handleBackClick}
          />
        )}
      </div>
    );
  }

  // Render based on view mode
  if (viewMode === 'simple') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          {/* Remove ViewToggle from here */}
      </div>
        <SimpleLoyalty
        loyaltyProgram={loyaltyProgram}
        loyaltyRewards={loyaltyRewards}
        businessId={user?.businessId || ''}
        onProgramSaved={handleProgramSaved}
        onRewardsChange={handleRewardsChange}
        onBackClick={handleBackClick}
      />
    </div>
  );
  }

  // Default detailed view
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Loyalty Program</h1>
        {/* Remove ViewToggle from here */}
      </div>
      <DetailedLoyalty
        loyaltyProgram={loyaltyProgram}
        loyaltyRewards={loyaltyRewards}
        businessId={user?.businessId || ''}
        onProgramSaved={handleProgramSaved}
        onRewardsChange={handleRewardsChange}
        showCelebration={showCelebration}
        onBackClick={handleBackClick}
      />
    </div>
  );
};

export default EmotionalLoyaltyPrograms;