import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Tabs, Tab, Box } from '@mui/material';
import { getLoyaltyProgram } from '../../services/loyalty/programService';
import { getLoyaltyRewards } from '../../services/loyalty/rewardService';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import LoyaltyProgramDetails from '../../components/loyalty/LoyaltyProgramDetails';
import LoyaltyMemberManager from '../../components/loyalty/LoyaltyMemberManager';
import LoyaltyProgramStats from '../../components/loyalty/LoyaltyProgramStats';
import CreateLoyaltyProgramModal from '../../components/loyalty/CreateLoyaltyProgramModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loyalty-tabpanel-${index}`}
      aria-labelledby={`loyalty-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EnhancedLoyaltyPrograms: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyProgram();
  }, [user]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle rewards change
  const handleRewardsChange = (updatedRewards: LoyaltyReward[]) => {
    setLoyaltyRewards(updatedRewards);
    if (loyaltyProgram) {
      setLoyaltyProgram({
        ...loyaltyProgram,
        rewards: updatedRewards
      });
    }
  };

  // Handle program saved
  const handleProgramSaved = (program: LoyaltyProgram) => {
    setLoyaltyProgram(program);
    setIsModalOpen(false);
    
    // Show celebration
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-3 text-purple-600 animate-pulse">
          Loading your loyalty program...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Only showing the Edit Program button, removed the duplicate header and back button */}
      <div className="flex justify-end mb-6">
        {loyaltyProgram && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            Edit Program
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
        {!loyaltyProgram && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Create Program
          </button>
        )}
      </div>

      {loyaltyProgram ? (
        <>
          {/* Program Stats */}
          <LoyaltyProgramStats 
            businessId={user?.businessId || ''} 
            program={loyaltyProgram} 
          />
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="loyalty program tabs"
              variant="fullWidth"
            >
              <Tab label="Program Details" />
              <Tab label="Program Members" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <LoyaltyProgramDetails 
              program={loyaltyProgram} 
              rewards={loyaltyRewards}
              onRewardsChange={handleRewardsChange}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <LoyaltyMemberManager
              businessId={user?.businessId || ''}
              program={loyaltyProgram}
            />
          </TabPanel>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <svg 
              className="mx-auto h-16 w-16 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3">Create Your First Loyalty Program</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start rewarding your loyal customers with a customized loyalty program. Increase customer retention and boost sales.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md"
          >
            Create Loyalty Program
          </button>
        </div>
      )}
      
      {/* Create Program Modal */}
      {isModalOpen && (
        <CreateLoyaltyProgramModal
          initialData={loyaltyProgram || undefined}
          onSave={handleProgramSaved}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
      
      {/* Celebration Effect */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white bg-blue-600 px-6 py-3 rounded-lg shadow-lg">
              Loyalty Program Created!
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLoyaltyPrograms;