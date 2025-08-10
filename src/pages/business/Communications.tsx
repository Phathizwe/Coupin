import React, { useEffect, useState } from 'react';
import CommunicationsHeader from '../../components/communications/CommunicationsHeader';
import CampaignsList from '../../components/communications/CampaignsList';
import CommunicationChannels from '../../components/communications/CommunicationChannels';
import MessageTemplates from '../../components/communications/MessageTemplates';
import BestPractices from '../../components/communications/BestPractices';
import MobileCommunications from '../../components/communications/MobileCommunications';
import { useCommunicationsData } from '../../hooks/useCommunicationsData';
import { useCommunicationsActions } from '../../hooks/useCommunicationsActions';
import { CommunicationTemplate, CommunicationCampaign } from '../../types';
import { useDashboardContext } from '../../layouts/DashboardLayout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Channel } from '../../types/communications';

const Communications: React.FC = () => {
  const { campaigns, templates, channels, loading, setCampaigns, setTemplates, setChannels } = useCommunicationsData();
  const { createDraftCampaign, createTemplate, updateChannel, error: actionError } = useCommunicationsActions();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [showCampaignOptions, setShowCampaignOptions] = useState(false);

  // Get the view mode from context
  const context = useDashboardContext();
  const viewMode = context?.viewMode || 'default';

  // Available channel types
  const channelTypes = ['email', 'sms', 'whatsapp'];

  // Handle errors from actions
  useEffect(() => {
    if (actionError) {
      setError(actionError);
    }
  }, [actionError]);

  // Handle campaign creation
  const handleCreateCampaign = async (type?: string) => {
    if (!type || !channelTypes.includes(type)) {
      setError('Please select a valid channel type: Email, SMS, or WhatsApp');
      return;
    }

    setError(null);
    setIsCreatingCampaign(true);

    try {
      const channelType = type as 'email' | 'sms' | 'whatsapp';

      const campaignData: Partial<CommunicationCampaign> = {
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Campaign`,
        templateId: '',
        channels: [channelType],
        targetAudience: 'all',
        status: 'draft'
      };

      const newCampaign = await createDraftCampaign(campaignData);

      if (newCampaign) {
        setCampaigns(prev => [newCampaign, ...prev]);
      } else {
        setError('Failed to create campaign. Please try again.');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsCreatingCampaign(false);
      setShowCampaignOptions(false);
    }
  };

  // Handle campaign edit
  const handleEditCampaign = (campaign: CommunicationCampaign) => {
    console.log('Editing campaign:', campaign);
    // Navigate to campaign editor page
    alert(`Editing campaign: ${campaign.name}`);
  };

  // Handle campaign delete
  const handleDeleteCampaign = (campaign: CommunicationCampaign) => {
    if (window.confirm(`Are you sure you want to delete the campaign "${campaign.name}"?`)) {
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
      alert(`Campaign "${campaign.name}" has been deleted.`);
    }
  };

  // Handle template creation
  const handleCreateTemplate = async (templateData: Partial<CommunicationTemplate>) => {
    setError(null);
    try {
      // Validate required fields
      if (!templateData.name || !templateData.type || !templateData.content) {
        setError('Please fill in all required fields');
        return null;
      }

      // For email templates, subject is required
      if (templateData.type === 'email' && !templateData.subject) {
        setError('Subject line is required for email templates');
        return null;
      }

      const newTemplate = await createTemplate(templateData);

      if (newTemplate) {
        setTemplates(prevTemplates => [newTemplate, ...prevTemplates]);
        return newTemplate;
      } else {
        setError('Failed to create template. Please try again.');
        return null;
      }
    } catch (err) {
      console.error('Error in handleCreateTemplate:', err);
      setError('An unexpected error occurred. Please try again.');
      return null;
    }
  };

  // Handle channel update
  const handleUpdateChannel = async (channelId: string, updates: Partial<Channel>): Promise<boolean> => {
    try {
      const success = await updateChannel(channelId, updates);

      if (success) {
        // Update local state
        setChannels(prev =>
          prev.map(ch => ch.id === channelId ? { ...ch, ...updates } : ch)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating channel:', err);
      setError('Failed to update channel settings');
      return false;
    }
  };

  // Render the simple/mobile view if viewMode is 'simple'
  if (viewMode === 'simple') {
    return (
      <ErrorBoundary>
        <MobileCommunications
          campaigns={campaigns}
          templates={templates}
          channels={channels}
          loading={loading}
          error={error}
          onCreateCampaign={handleCreateCampaign}
          onEditCampaign={handleEditCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onCreateTemplate={handleCreateTemplate}
          onUpdateChannel={handleUpdateChannel}
          isCreatingCampaign={isCreatingCampaign}
        />
      </ErrorBoundary>
    );
  }

  // Render the default view
  return (
    <div>
      <CommunicationsHeader
        onCreateCampaign={handleCreateCampaign}
        isCreating={isCreatingCampaign}
        showOptions={showCampaignOptions}
        setShowOptions={setShowCampaignOptions}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <CampaignsList
        campaigns={campaigns}
        loading={loading.campaigns}
        onEdit={handleEditCampaign}
        onDelete={handleDeleteCampaign}
        onCreateCampaign={handleCreateCampaign}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CommunicationChannels
          channels={channels}
          templates={templates}
          loading={loading.channels}
          onUpdateChannel={handleUpdateChannel}
        />

        <MessageTemplates
          templates={templates}
          loading={loading.templates}
          onCreateTemplate={handleCreateTemplate}
          error={error}
        />
      </div>

      <BestPractices />
    </div>
  );
};

export default Communications;