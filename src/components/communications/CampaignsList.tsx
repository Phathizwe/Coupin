import React, { useState } from 'react';
import EmptyCampaignState from './EmptyCampaignState';
import SearchFilter from './SearchFilter';
import { CommunicationCampaign } from '../../types';

interface CampaignsListProps {
  campaigns: CommunicationCampaign[];
  loading: boolean;
  onEdit: (campaign: CommunicationCampaign) => void;
  onDelete: (campaign: CommunicationCampaign) => void;
  onCreateCampaign?: (type?: string) => Promise<void>;
}

const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  loading,
  onEdit,
  onDelete,
  onCreateCampaign
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasCampaigns = filteredCampaigns.length > 0;

  // Format date for display
  const formatDate = (date: any) => {
    if (!date) return 'N/A';

    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Communication Campaigns</h2>
        <SearchFilter onSearch={setSearchTerm} />
      </div>

      <div className="border-t pt-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : !hasCampaigns ? (
          <EmptyCampaignState onCreateCampaign={onCreateCampaign ? () => onCreateCampaign('email') : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channels
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">
                        {campaign.targetAudience === 'all' ? 'All Customers' :
                          campaign.targetAudience === 'segment' ? 'Customer Segment' :
                            'Specific Customers'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {campaign.channels.includes('email') && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Email</span>
                        )}
                        {campaign.channels.includes('sms') && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">SMS</span>
                        )}
                        {campaign.channels.includes('whatsapp') && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">WhatsApp</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {campaign.stats ? (
                        <div className="text-xs">
                          <span className="mr-2">Sent: {campaign.stats.sent}</span>
                          <span className="mr-2">Opened: {campaign.stats.opened || 0}</span>
                          <span>Clicked: {campaign.stats.clicked || 0}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No stats available</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(campaign)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(campaign)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsList;