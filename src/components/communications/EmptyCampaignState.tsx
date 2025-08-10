import React from 'react';
import { MessageIcon, PlusIcon } from '../icons/Icons';

interface EmptyCampaignStateProps {
  onCreateCampaign?: () => void;
}

const EmptyCampaignState: React.FC<EmptyCampaignStateProps> = ({ onCreateCampaign }) => {
  return (
    <div className="text-center py-8">
      <MessageIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No communication campaigns yet</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign to reach your customers.</p>
      <div className="mt-6">
        <button
          onClick={onCreateCampaign}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create New Campaign
        </button>
      </div>
    </div>
  );
};

export default EmptyCampaignState;