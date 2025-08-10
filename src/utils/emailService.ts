import { CommunicationTemplate } from '../types';
import { parseEmailTemplate } from './templateParser';
import { encodeMailtoUrl } from './urlUtils';
import { toast } from 'react-hot-toast';

/**
 * Opens the default email client with optional template content
 * @param template Optional template to pre-fill in email
 * @returns Promise that resolves with success status
 */
export const openEmailClient = async (template?: CommunicationTemplate): Promise<boolean> => {
  try {
    let url = 'mailto:';
    
    // If template is provided, parse it and add subject/body
    if (template && template.content) {
      const { subject, body } = parseEmailTemplate(template);
      url = encodeMailtoUrl(subject, body);
    }
    
    console.log(`Opening email client with URL: ${url}`);
    
    // Open the mailto URL
    window.location.href = url;
    
    // Since we can't reliably detect if the email client opened successfully,
    // we'll assume it did if no error was thrown
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
};

/**
 * Updates the email channel configuration status
 * @param businessId Business ID
 * @param channelId Channel ID
 * @param isConfigured New configuration status
 * @returns Promise that resolves with success status
 */
export const updateEmailChannelStatus = async (
  businessId: string,
  channelId: string,
  isConfigured: boolean
): Promise<boolean> => {
  try {
    // This would typically update the channel status in Firestore
    // For now, we'll just simulate success
    console.log(`Updating email channel ${channelId} for business ${businessId} to ${isConfigured ? 'configured' : 'not configured'}`);
    
    // In a real implementation, this would call a Firestore update
    // await updateDoc(doc(db, 'businesses', businessId, 'communicationChannels', channelId), {
    //   isConfigured,
    //   updatedAt: serverTimestamp()
    // });
    
    return true;
  } catch (error) {
    console.error('Error updating email channel status:', error);
    return false;
  }
};

/**
 * Handles the email connection process
 * @param businessId Business ID
 * @param channelId Channel ID
 * @param templates Available templates
 * @returns Promise that resolves with success status
 */
export const connectEmail = async (
  businessId: string,
  channelId: string,
  templates: CommunicationTemplate[]
): Promise<boolean> => {
  try {
    // Find the first email template if available
    const emailTemplate = templates.find(t => t.type === 'email');
    
    // Open email client with the template if available
    const opened = await openEmailClient(emailTemplate);
    
    if (opened) {
      // Update channel status
      const updated = await updateEmailChannelStatus(businessId, channelId, true);
      
      if (updated) {
        toast.success('Email client connected successfully');
        return true;
      } else {
        toast.error('Failed to update email connection status');
      }
    } else {
      toast.error('Failed to open email client. Please check your default email application settings.');
    }
    
    return false;
  } catch (error) {
    console.error('Error connecting email:', error);
    toast.error('An error occurred while connecting email');
    return false;
  }
};