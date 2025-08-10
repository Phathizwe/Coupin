import React from 'react';

interface LoyaltyProgramTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LoyaltyProgramTabs: React.FC<LoyaltyProgramTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          className={`${
            activeTab === 'active'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={() => onTabChange('active')}
        >
          Active Programs
        </button>
        <button
          className={`${
            activeTab === 'draft'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={() => onTabChange('draft')}
        >
          Drafts
        </button>
        <button
          className={`${
            activeTab === 'archived'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          onClick={() => onTabChange('archived')}
        >
          Archived
        </button>
      </nav>
    </div>
  );
};

export default LoyaltyProgramTabs;