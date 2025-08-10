import { useState } from 'react';
import { useAuth } from './useAuth';
import { CommunicationCampaign, CommunicationTemplate } from '../types';
import { createCampaign, createTemplate as createTemplateService } from '../services/communicationsService';
import { Channel } from '../types/communications';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useCommunicationsActions = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Create a draft campaign
  const createDraftCampaign = async (campaignData: Partial<CommunicationCampaign>): Promise<CommunicationCampaign | null> => {
    setError(null);
    
    if (!user?.businessId) {
      setError('You must be logged in to create a campaign');
      return null;
    }
    
    try {
      return await createCampaign(user.businessId, campaignData);
    } catch (err) {
      console.error('Error in createDraftCampaign:', err);
      setError('Failed to create campaign');
      return null;
    }
  };

  // Create a message template
  const createTemplate = async (templateData: Partial<CommunicationTemplate>): Promise<CommunicationTemplate | null> => {
    setError(null);
    
    if (!user?.businessId) {
      setError('You must be logged in to create a template');
      return null;
    }
    
    try {
      return await createTemplateService(user.businessId, templateData);
    } catch (err) {
      console.error('Error in createTemplate:', err);
      setError('Failed to create template');
      return null;
    }
  };

  // Update a communication channel
  const updateChannel = async (channelId: string, updates: Partial<Channel>): Promise<boolean> => {
    setError(null);
    
    if (!user?.businessId) {
      setError('You must be logged in to update a channel');
      return false;
    }
    
    try {
      const channelRef = doc(db, 'businesses', user.businessId, 'communicationChannels', channelId);
      
      await updateDoc(channelRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error('Error updating channel:', err);
      setError('Failed to update channel');
      return false;
    }
  };

  return {
    createDraftCampaign,
    createTemplate,
    updateChannel,
    error
  };
};