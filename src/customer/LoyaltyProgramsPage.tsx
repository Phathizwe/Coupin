import React, { useEffect, useState } from 'react';
import { LoyaltyProgram } from '../types';
import { customerLoyaltyService } from './services/loyaltyService';
import { useAuth } from '../hooks/useAuth';
import EmptyLoyaltyState from './components/EmptyLoyaltyState';
import LoyaltyProgramList from './components/LoyaltyProgramList';
import LoadingSpinner from './components/LoadingSpinner';

const LoyaltyProgramsPage: React.FC = () => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLoyaltyPrograms = async () => {
      setIsLoading(true);
      try {
        if (user?.uid) {
          console.log('Fetching loyalty programs for user:', user.uid);

          // Use the standard approach which now prioritizes business ID lookup
          const programs = await customerLoyaltyService.getCustomerLoyaltyPrograms(user.uid);
          
          console.log('Loyalty programs found:', programs);
          setLoyaltyPrograms(programs);
        }
      } catch (error) {
        console.error('Error fetching loyalty programs:', error);
      } finally {
        setIsLoading(false);
      }
};

    fetchLoyaltyPrograms();
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Loyalty Programs</h1>
      
      {loyaltyPrograms.length > 0 ? (
        <LoyaltyProgramList programs={loyaltyPrograms} />
      ) : (
        <EmptyLoyaltyState />
      )}
    </div>
  );
};

export default LoyaltyProgramsPage;
