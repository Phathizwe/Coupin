import React from 'react';
import { CustomerLoyaltyProgram } from '../types/loyalty';
import LoyaltyProgramCard from './LoyaltyProgramCard';

interface LoyaltyProgramListProps {
  programs: CustomerLoyaltyProgram[];
}

const LoyaltyProgramList: React.FC<LoyaltyProgramListProps> = ({ programs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map(program => (
        <LoyaltyProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
};

export default LoyaltyProgramList;