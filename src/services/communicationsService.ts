import { collection, query, getDocs, addDoc, doc, Timestamp, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CommunicationCampaign, CommunicationTemplate } from '../types';
import { Channel } from '../types/communications';

// Fetch campaigns from Firestore
export const fetchCampaigns = async (businessId: string): Promise<CommunicationCampaign[]> => {
  if (!businessId) return [];
  
  try {
    const campaignsRef = collection(db, 'businesses', businessId, 'campaigns');
    const campaignsQuery = query(campaignsRef);
    const querySnapshot = await getDocs(campaignsQuery);
    
    const campaignsData: CommunicationCampaign[] = [];
    querySnapshot.forEach((doc) => {
      campaignsData.push({
        id: doc.id,
        ...doc.data()
      } as CommunicationCampaign);
    });
    
    return campaignsData;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

// Fetch message templates from Firestore
export const fetchTemplates = async (businessId: string): Promise<CommunicationTemplate[]> => {
  if (!businessId) return [];
  
  try {
    const templatesRef = collection(db, 'businesses', businessId, 'messageTemplates');
    const templatesQuery = query(templatesRef);
    const querySnapshot = await getDocs(templatesQuery);
    
    const templatesData: CommunicationTemplate[] = [];
    querySnapshot.forEach((doc) => {
      templatesData.push({
        id: doc.id,
        ...doc.data()
      } as CommunicationTemplate);
    });
    
    return templatesData;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

// Fetch communication channels from Firestore
export const fetchChannels = async (businessId: string): Promise<Channel[]> => {
  if (!businessId) return [];
  
  try {
    const channelsRef = collection(db, 'businesses', businessId, 'communicationChannels');
    const channelsQuery = query(channelsRef);
    const querySnapshot = await getDocs(channelsQuery);
    
    const channelsData: Channel[] = [];
    querySnapshot.forEach((doc) => {
      channelsData.push({
        id: doc.id,
        ...doc.data()
      } as Channel);
    });
    
    return channelsData;
  } catch (error) {
    console.error('Error fetching channels:', error);
    return [];
  }
};

// Create default communication channels if none exist
export const createDefaultChannels = async (businessId: string): Promise<Channel[]> => {
  if (!businessId) return [];
  
  const defaultChannels: Omit<Channel, 'id'>[] = [
    {
      type: 'email',
      isConfigured: false,
      settings: {}
    },
    {
      type: 'sms',
      isConfigured: false,
      settings: {}
    },
    {
      type: 'whatsapp',
      isConfigured: false,
      settings: {}
    }
  ];
  
  const createdChannels: Channel[] = [];
  
  try {
    for (const channel of defaultChannels) {
      const channelsRef = collection(db, 'businesses', businessId, 'communicationChannels');
      const docRef = await addDoc(channelsRef, {
        ...channel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      createdChannels.push({
        id: docRef.id,
        ...channel
      });
    }
  } catch (error) {
    console.error('Error creating default channels:', error);
  }
  
  return createdChannels;
};

// Clean up duplicate channels, keeping only one of each type
export const cleanupDuplicateChannels = async (businessId: string): Promise<Channel[]> => {
  if (!businessId) return [];
  
  try {
    const channelsRef = collection(db, 'businesses', businessId, 'communicationChannels');
    const channelsQuery = query(channelsRef);
    const querySnapshot = await getDocs(channelsQuery);
    
    const channelsMap = new Map<string, { id: string, data: Channel }>();
    
    // Process all channels, keeping track of the latest one for each type
    querySnapshot.forEach((doc) => {
      const channelData = { id: doc.id, ...doc.data() } as Channel;
      const existingChannel = channelsMap.get(channelData.type);
      
      // If we don't have this type yet, or this one is newer, keep it
      if (!existingChannel || 
          (channelData.updatedAt && existingChannel.data.updatedAt && 
           channelData.updatedAt > existingChannel.data.updatedAt)) {
        channelsMap.set(channelData.type, { id: doc.id, data: channelData });
      }
    });
    
    // Delete duplicate channels
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((doc) => {
      const channelData = { id: doc.id, ...doc.data() } as Channel;
      const keptChannel = channelsMap.get(channelData.type);
      
      // If this channel is not the one we're keeping, delete it
      if (keptChannel && keptChannel.id !== doc.id) {
        const docRef = doc.ref;
        deletePromises.push(deleteDoc(docRef));
      }
    });
    
    // Wait for all deletes to complete
    if (deletePromises.length > 0) {
      console.log(`Cleaning up ${deletePromises.length} duplicate channels`);
      await Promise.all(deletePromises);
    }
    
    // Return the cleaned up channels
    return Array.from(channelsMap.values()).map(item => item.data);
  } catch (error) {
    console.error('Error cleaning up duplicate channels:', error);
    return [];
  }
};

// Create a new campaign
export const createCampaign = async (
  businessId: string, 
  campaignData: Partial<CommunicationCampaign>
): Promise<CommunicationCampaign | null> => {
  if (!businessId) return null;
  
  try {
    const campaignsRef = collection(db, 'businesses', businessId, 'campaigns');
    const newCampaign = {
      ...campaignData,
      businessId: businessId,
      status: campaignData.status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(campaignsRef, newCampaign);
    return {
      id: docRef.id,
      ...newCampaign,
      createdAt: new Date(),  // Convert for local use
      updatedAt: new Date()   // Convert for local use
    } as CommunicationCampaign;
  } catch (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
};

// Delete a campaign
export const deleteCampaign = async (
  businessId: string,
  campaignId: string
): Promise<boolean> => {
  if (!businessId || !campaignId) return false;
  
  try {
    const campaignRef = doc(db, 'businesses', businessId, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
    return true;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
};

// Create a new template
export const createTemplate = async (
  businessId: string, 
  templateData: Partial<CommunicationTemplate>
): Promise<CommunicationTemplate | null> => {
  console.log('createTemplate called with businessId:', businessId);
  console.log('templateData:', templateData);
  
  if (!businessId) {
    console.error('Cannot create template: No businessId provided');
    return null;
  }
  
  try {
    // Validate required fields
    if (!templateData.name) {
      console.error('Template name is required');
      return null;
    }
    
    if (!templateData.type) {
      console.error('Template type is required');
      return null;
    }
    
    if (!templateData.content) {
      console.error('Template content is required');
      return null;
    }
    
    // Extract variables from content
    const variables: string[] = [];
    
    if (templateData.content) {
      const variableRegex = /\{([^}]+)\}/g;
      let match;
      
      while ((match = variableRegex.exec(templateData.content)) !== null) {
        variables.push(match[1]);
      }
    }
    
    // Create a template object with proper typing
    const templateToSave: Record<string, any> = {
      name: templateData.name,
      type: templateData.type,
      content: templateData.content,
      businessId: businessId,
      variables: Array.from(new Set(variables)), // Remove duplicates
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add subject if it's an email template
    if (templateData.type === 'email' && templateData.subject) {
      templateToSave.subject = templateData.subject;
    }
    
    console.log('Template data to save:', templateToSave);
    
    // Get the reference to the messageTemplates collection
    console.log('Getting collection reference for path:', `businesses/${businessId}/messageTemplates`);
    const templatesRef = collection(db, 'businesses', businessId, 'messageTemplates');
    
    // Try to add the document
    console.log('About to call addDoc');
    const docRef = await addDoc(templatesRef, templateToSave);
    console.log('Document added with ID:', docRef.id);
    
    // Return the created template
    return {
      id: docRef.id,
      ...templateToSave,
      createdAt: new Date(),  // Convert for local use
      updatedAt: new Date()   // Convert for local use
    } as CommunicationTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return null;
  }
};