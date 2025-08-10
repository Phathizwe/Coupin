import React from 'react';
import { CommunicationCampaign } from '../../types';
import { PlusIcon, ChevronDownIcon } from '../icons/Icons';

interface CommunicationsHeaderProps {
  campaigns?: CommunicationCampaign[];
  loading?: boolean;
  onEdit?: (campaign: CommunicationCampaign) => void;
  onDelete?: (campaign: CommunicationCampaign) => void;
  onCreateCampaign: (type?: string) => void;
  isCreating?: boolean;
  showOptions?: boolean;
  setShowOptions: (show: boolean) => void;
}

const CommunicationsHeader: React.FC<CommunicationsHeaderProps> = ({ 
  onCreateCampaign,
  isCreating = false,
  showOptions = false,
  setShowOptions
}) => {
  const handleCreateCampaign = (type?: string) => {
    setShowOptions(false);
    onCreateCampaign(type);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Communication Campaigns</h2>
        <div className="relative">
          <button 
            className={`bg-blue-500 text-white px-4 py-2 rounded-l hover:bg-blue-600 flex items-center ${isCreating ? 'opacity-75 cursor-wait' : ''}`}
            onClick={() => handleCreateCampaign()}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5 mr-2" />
                Create New Campaign
              </>
            )}
          </button>
          
          <button
            className="bg-blue-600 text-white px-2 py-2 rounded-r hover:bg-blue-700 border-l border-blue-400"
            onClick={() => setShowOptions(!showOptions)}
            disabled={isCreating}
          >
            <ChevronDownIcon className="w-5 h-5" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  onClick={() => handleCreateCampaign('email')}
                >
                  Email Campaign
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  onClick={() => handleCreateCampaign('sms')}
                >
                  SMS Campaign
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                  onClick={() => handleCreateCampaign('multi')}
                >
                  Multi-channel Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationsHeader;