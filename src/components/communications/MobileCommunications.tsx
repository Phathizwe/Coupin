import React, { useState } from 'react';
import { CommunicationTemplate, CommunicationCampaign } from '../../types';
import EmptyCampaignState from './EmptyCampaignState';
import { Channel } from '../../types/communications';
import { connectWhatsApp } from '../../utils/whatsappService';
import { useAuth } from '../../hooks/useAuth';

interface MobileCommunicationsProps {
  campaigns: CommunicationCampaign[];
  templates: CommunicationTemplate[];
  channels: Channel[];
  loading: {
    campaigns: boolean;
    templates: boolean;
    channels: boolean;
  };
  error: string | null;
  onCreateCampaign: (type?: string) => Promise<void>;
  onEditCampaign: (campaign: CommunicationCampaign) => void;
  onDeleteCampaign: (campaign: CommunicationCampaign) => void;
  onCreateTemplate: (templateData: Partial<CommunicationTemplate>) => Promise<CommunicationTemplate | null>;
  onUpdateChannel?: (channelId: string, updates: Partial<Channel>) => Promise<boolean>;
  isCreatingCampaign: boolean;
}

const MobileCommunications: React.FC<MobileCommunicationsProps> = ({
  campaigns,
  templates,
  channels,
  loading,
  error,
  onCreateCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onCreateTemplate,
  onUpdateChannel,
  isCreatingCampaign
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'channels'>('campaigns');
  const [connectingChannel, setConnectingChannel] = useState<string | null>(null);

  // Handle WhatsApp connect
  const handleConnectWhatsApp = async (channel: Channel) => {
    if (channel.type !== 'whatsapp' || !user?.businessId) return;

    setConnectingChannel(channel.id);

    try {
      const success = await connectWhatsApp(user.businessId, channel.id, templates);

      if (success && onUpdateChannel) {
        await onUpdateChannel(channel.id, { isConfigured: true });
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    } finally {
      setConnectingChannel(null);
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Mobile Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-2 px-4 text-center ${activeTab === 'campaigns'
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
            }`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${activeTab === 'templates'
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
            }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${activeTab === 'channels'
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-500'
            }`}
          onClick={() => setActiveTab('channels')}
        >
          Channels
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Communication Campaigns</h2>
            <button
              onClick={() => onCreateCampaign('email')}
              disabled={isCreatingCampaign}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              {isCreatingCampaign ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span>Create Campaign</span>
              )}
            </button>
          </div>

          {loading.campaigns ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyCampaignState onCreateCampaign={() => onCreateCampaign('email')} />
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className="capitalize">{campaign.status}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditCampaign(campaign)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteCampaign(campaign)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Message Templates</h2>
            <button
              onClick={() => {
                // Open template creation modal
                const templateData: Partial<CommunicationTemplate> = {
                  name: 'New Template',
                  type: 'email',
                  content: '',
                  subject: '',
                  variables: []
                };
                onCreateTemplate(templateData);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              New Template
            </button>
          </div>

          {loading.templates ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating a new message template.</p>
              <button
                onClick={() => {
                  const templateData: Partial<CommunicationTemplate> = {
                    name: 'New Template',
                    type: 'email',
                    content: '',
                    subject: '',
                    variables: []
                  };
                  onCreateTemplate(templateData);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map(template => (
                <div key={template.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Type: <span className="capitalize">{template.type}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'channels' && (
        <div>
          <h2 className="text-lg font-medium mb-4">Communication Channels</h2>

          {loading.channels ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading channels...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map(channel => (
                <div key={channel.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{channel.type}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: {channel.isConfigured ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                    <button
                      onClick={() => channel.type === 'whatsapp' && handleConnectWhatsApp(channel)}
                      disabled={connectingChannel === channel.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded ${channel.isConfigured
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'text-white bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                      {connectingChannel === channel.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </>
                      ) : channel.isConfigured ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileCommunications;