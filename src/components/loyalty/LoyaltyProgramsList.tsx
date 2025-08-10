import React from 'react';
import { LoyaltyProgram } from '../../types';
import LoyaltyProgramCard from './LoyaltyProgramCard';
import EmptyState from './EmptyState';

interface LoyaltyProgramsListProps {
  programs: LoyaltyProgram[];
  activeTab: string;
  onCreateClick: () => void;
  onViewDetails: () => void;
}

const LoyaltyProgramsList: React.FC<LoyaltyProgramsListProps> = ({
  programs,
  activeTab,
  onCreateClick,
  onViewDetails
}) => {
  if (programs.length === 0) {
    return (
      <EmptyState 
        activeTab={activeTab}
        onCreateClick={onCreateClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => (
        <LoyaltyProgramCard
          key={program.id}
          program={program}
          onEdit={onCreateClick}
          onViewDetails={onViewDetails}
          onManageRewards={onViewDetails}
        />
      ))}
    </div>
  );
};

export default LoyaltyProgramsList;