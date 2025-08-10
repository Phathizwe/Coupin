import React from 'react';
import SavingsProgress from '../emotional/SavingsProgress';

interface SavingsProgressSectionProps {
  monthlySaved: number;
  monthlySavingsGoal: number;
}

const SavingsProgressSection: React.FC<SavingsProgressSectionProps> = ({
  monthlySaved,
  monthlySavingsGoal
}) => {
  return (
    <div className="px-4 mb-6">
      <SavingsProgress 
        currentAmount={monthlySaved} 
        goalAmount={monthlySavingsGoal} 
        variant="compact" 
      />
    </div>
  );
};

export default SavingsProgressSection;