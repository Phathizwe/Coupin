import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCustomerPrograms } from '../services/customerProgramService';
import { findCustomerByUserId } from '../services/customerLinkingService';
import LoyaltyProgramCard from './components/LoyaltyProgramCard';
import LoyaltyCardQR from './components/LoyaltyCardQR';
import EmptyLoyaltyState from './components/EmptyLoyaltyState';
import LoadingSpinner from './components/LoadingSpinner';

const LoyaltyProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!user) return;
      try {
      setLoading(true);

        // Find customer profile linked to this user
        const customer = await findCustomerByUserId(user.uid);

        if (!customer) {
          setPrograms([]);
      setLoading(false);
          return;
    }

        // Get all programs this customer is enrolled in
        const customerPrograms = await getCustomerPrograms(customer.id);
        setPrograms(customerPrograms);

        // Set the first program as selected by default
        if (customerPrograms.length > 0) {
          setSelectedProgram(customerPrograms[0]);
        }
      } catch (error) {
        console.error('Error fetching loyalty programs:', error);
      } finally {
        setLoading(false);
      }
  };

    fetchPrograms();
  }, [user]);

  const handleProgramSelect = (program: any) => {
    setSelectedProgram(program);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (programs.length === 0) {
    return <EmptyLoyaltyState />;
  }
    return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Loyalty Programs</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">My Programs</h2>
            
            <div className="space-y-4">
              {programs.map(program => (
        <div 
                  key={program.id}
                  className={`cursor-pointer p-3 rounded-lg transition-colors ${
                    selectedProgram?.id === program.id 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleProgramSelect(program)}
        >
                  <LoyaltyProgramCard program={program} />
                </div>
              ))}
            </div>
          </div>
              </div>

        <div className="md:col-span-2">
          {selectedProgram ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedProgram.programName || 'Loyalty Card'}
              </h2>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <LoyaltyCardQR program={selectedProgram} />
                </div>
                
                <div className="flex-grow">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Your Progress</h3>
                    <div className="bg-gray-100 rounded-full h-4 w-full">
                      <div 
                        className="bg-blue-500 h-4 rounded-full" 
                        style={{ 
                          width: `${Math.min(
                            (selectedProgram.progress.visits / (selectedProgram.visitsRequired || 10)) * 100, 
                            100
                          )}%` 
                        }}
                      ></div>
          </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedProgram.progress.visits} / {selectedProgram.visitsRequired || 10} visits
        </div>
    </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Points Balance</h3>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedProgram.progress.points} pts
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Available Rewards</h3>
                    {selectedProgram.rewards?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProgram.rewards.map((reward: any) => (
                          <div key={reward.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-gray-600">{reward.description}</div>
                            <div className="mt-1 text-blue-600 font-medium">
                              {reward.pointsCost} points
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No rewards available yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <div className="text-gray-500">
                Select a loyalty program to view details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramsPage;