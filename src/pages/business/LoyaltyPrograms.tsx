import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoyaltyProgramDetails from '../../components/loyalty/LoyaltyProgramDetails';
import CreateLoyaltyProgramModal from '../../components/loyalty/CreateLoyaltyProgramModal';
import LoyaltyMembersList from '../../components/loyalty2/LoyaltyMembersList';
import { getLoyaltyProgram } from '../../services/loyalty/programService';
import { LoyaltyProgram, LoyaltyReward } from '../../types';
import { Tabs, Tab, Box } from '@mui/material';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LoyaltyPrograms: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchProgram = async () => {
      if (!user?.businessId && !businessProfile?.businessId) return;
      
      try {
        const businessId = user?.businessId || businessProfile?.businessId;
        const program = await getLoyaltyProgram(businessId!);
        setSelectedProgram(program);
        if (program && program.rewards) {
          setRewards(program.rewards);
        }
      } catch (error) {
        console.error('Error fetching loyalty program:', error);
      }
    };

    fetchProgram();
  }, [user, businessProfile]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRewardsChange = (updatedRewards: LoyaltyReward[]) => {
    setRewards(updatedRewards);
    if (selectedProgram) {
      setSelectedProgram({
        ...selectedProgram,
        rewards: updatedRewards
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Programs</h1>
        {!selectedProgram && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Create Program
          </button>
        )}
      </div>
      
      {selectedProgram ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="loyalty program tabs">
              <Tab label="Program Details" />
              <Tab label="Program Members" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <LoyaltyProgramDetails 
              program={selectedProgram} 
              rewards={rewards}
              onRewardsChange={handleRewardsChange}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <LoyaltyMembersList />
          </TabPanel>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-500 mb-4">
            No loyalty program found. Create your first loyalty program to start rewarding your customers.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Create Loyalty Program
            </button>
          </div>
        </div>
      )}
      
      {isModalOpen && (
        <CreateLoyaltyProgramModal
          initialData={undefined}
          onSave={(program) => {
            setSelectedProgram(program);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LoyaltyPrograms;