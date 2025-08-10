import React from 'react';

interface LoyaltyProgramHeaderProps {
  hasProgram: boolean;
  onCreateClick: () => void;
  loading: boolean;
}

const LoyaltyProgramHeader: React.FC<LoyaltyProgramHeaderProps> = ({
  hasProgram,
  onCreateClick,
  loading
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div></div>
      <button 
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        onClick={onCreateClick}
        disabled={loading}
      >
        {hasProgram ? 'Edit Program' : 'Create New Program'}
      </button>
    </div>
  );
};

export default LoyaltyProgramHeader;