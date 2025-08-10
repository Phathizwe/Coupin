import React from 'react';

interface EmptyStateProps {
  activeTab: string;
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab, onCreateClick }) => {
  return (
    <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">No loyalty programs found</h3>
      <p className="text-gray-500 mb-4">
        {activeTab === 'active' && "You don't have any active loyalty programs."}
        {activeTab === 'draft' && "You don't have any draft loyalty programs."}
        {activeTab === 'archived' && "You don't have any archived loyalty programs."}
      </p>
      <button 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        onClick={onCreateClick}
      >
        Create Your First Program
      </button>
    </div>
  );
};

export default EmptyState;