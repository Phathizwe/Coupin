import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { CommunicationCampaign, CommunicationTemplate } from '../types';
import { Channel, LoadingState } from '../types/communications';
import { 
  fetchCampaigns, 
  fetchTemplates, 
  fetchChannels,
  createDefaultChannels,
  cleanupDuplicateChannels
} from '../services/communicationsService';

export const useCommunicationsData = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    campaigns: true,
    templates: true,
    channels: true
  });

  // Fetch campaigns from Firestore
  useEffect(() => {
    const getCampaigns = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(prev => ({ ...prev, campaigns: true }));
        const campaignsData = await fetchCampaigns(user.businessId);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error in campaigns hook:', error);
      } finally {
        setLoading(prev => ({ ...prev, campaigns: false }));
      }
    };
    
    if (user?.businessId) {
      getCampaigns();
    }
  }, [user]);

  // Fetch message templates from Firestore
  useEffect(() => {
    const getTemplates = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(prev => ({ ...prev, templates: true }));
        const templatesData = await fetchTemplates(user.businessId);
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error in templates hook:', error);
      } finally {
        setLoading(prev => ({ ...prev, templates: false }));
      }
    };
    
    if (user?.businessId) {
      getTemplates();
    }
  }, [user]);

  // Fetch communication channels from Firestore
  useEffect(() => {
    const getChannels = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(prev => ({ ...prev, channels: true }));
        let channelsData = await fetchChannels(user.businessId);
        
        // If no channels are configured yet, create default ones
        if (channelsData.length === 0) {
          const defaultChannels = await createDefaultChannels(user.businessId);
          channelsData = defaultChannels;
        } 
        // If we have duplicate channels, clean them up
        else if (hasDuplicateChannelTypes(channelsData)) {
          console.log('Duplicate channels detected, cleaning up...');
          channelsData = await cleanupDuplicateChannels(user.businessId);
        }
        
        setChannels(channelsData);
      } catch (error) {
        console.error('Error in channels hook:', error);
      } finally {
        setLoading(prev => ({ ...prev, channels: false }));
    }
  };
    
    if (user?.businessId) {
      getChannels();
    }
  }, [user]);

  return {
    campaigns,
    templates,
    channels,
    loading,
    setCampaigns,
    setTemplates,
    setChannels  // Added missing setChannels here
};
};

// Helper function to detect duplicate channel types
const hasDuplicateChannelTypes = (channels: Channel[]): boolean => {
  const types = new Set<string>();
  for (const channel of channels) {
    if (types.has(channel.type)) {
      return true;
    }
    types.add(channel.type);
  }
  return false;
};