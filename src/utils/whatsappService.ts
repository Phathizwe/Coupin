import { CommunicationTemplate } from '../types';
import { toast } from 'react-hot-toast';

/**
 * Opens WhatsApp Desktop or Web with optional template content
 * @param template Optional template to pre-fill in WhatsApp
 * @returns Promise that resolves with success status
 */
export const openWhatsApp = async (template?: CommunicationTemplate): Promise<boolean> => {
  try {
    let url = 'whatsapp://';
    
    // If template is provided, add it as pre-filled text
    if (template && template.content) {
      // Encode the template content for URL
      const encodedText = encodeURIComponent(template.content);
      url = `whatsapp://send?text=${encodedText}`;
    }
    
    console.log(`Opening WhatsApp with URL: ${url}`);
    
    // Try to open WhatsApp Desktop
    const opened = await openExternalProtocol(url);
    
    if (!opened) {
      // Fallback to WhatsApp Web if desktop app fails
      console.log('WhatsApp Desktop not available, falling back to web');
      window.open('https://web.whatsapp.com/', '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    return false;
  }
};

/**
 * Helper function to open external protocol
 * @param url URL with protocol to open
 * @returns Promise that resolves with success status
 */
const openExternalProtocol = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create hidden iframe to attempt opening the protocol
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set timeout to detect if protocol handler worked
    const timeoutId = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve(false); // Protocol failed to open
    }, 2000);
    
    // Handle successful opening
    iframe.onload = () => {
      clearTimeout(timeoutId);
      document.body.removeChild(iframe);
      resolve(true); // Protocol successfully opened
    };
    
    // Try to open the URL
    iframe.src = url;
  });
};

/**
 * Updates the channel configuration status in Firestore
 * @param businessId Business ID
 * @param channelId Channel ID
 * @param isConfigured New configuration status
 * @returns Promise that resolves with success status
 */
export const updateWhatsAppChannelStatus = async (
  businessId: string,
  channelId: string,
  isConfigured: boolean
): Promise<boolean> => {
  try {
    // This would typically update the channel status in Firestore
    // For now, we'll just simulate success
    console.log(`Updating WhatsApp channel ${channelId} for business ${businessId} to ${isConfigured ? 'configured' : 'not configured'}`);
    
    // In a real implementation, this would call a Firestore update
    // await updateDoc(doc(db, 'businesses', businessId, 'communicationChannels', channelId), {
    //   isConfigured,
    //   updatedAt: serverTimestamp()
    // });
    
    return true;
  } catch (error) {
    console.error('Error updating WhatsApp channel status:', error);
    return false;
  }
};

/**
 * Handles the WhatsApp connection process
 * @param businessId Business ID
 * @param channelId Channel ID
 * @param templates Available templates
 * @returns Promise that resolves with success status
 */
export const connectWhatsApp = async (
  businessId: string,
  channelId: string,
  templates: CommunicationTemplate[]
): Promise<boolean> => {
  try {
    // Find the first WhatsApp template if available
    const whatsAppTemplate = templates.find(t => t.type === 'whatsapp' || t.type === 'sms');
    // Replaced 'text' with 'sms' as per the valid types in CommunicationTemplate interface
    
    // Open WhatsApp with the template if available
    const opened = await openWhatsApp(whatsAppTemplate);
    
    if (opened) {
      // Update channel status
      const updated = await updateWhatsAppChannelStatus(businessId, channelId, true);
      
      if (updated) {
        toast.success('WhatsApp connected successfully');
        return true;
      } else {
        toast.error('Failed to update WhatsApp connection status');
      }
    } else {
      toast.error('Failed to open WhatsApp. Please make sure it is installed.');
    }
    
    return false;
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    toast.error('An error occurred while connecting WhatsApp');
    return false;
  }
};