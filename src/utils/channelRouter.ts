import { CommunicationTemplate } from '../types';
import { processTemplateForChannel } from './templateProcessor';
import { encodeMailtoUrl } from './urlUtils';
import { toast } from 'react-hot-toast';

/**
 * Opens the appropriate communication channel with the template content
 * @param template The template to use
 * @param channelType The channel type to open
 * @returns Promise that resolves with success status
 */
export const openChannelWithTemplate = async (
  template: CommunicationTemplate,
  channelType: 'email' | 'sms' | 'whatsapp'
): Promise<boolean> => {
  try {
    // Process the template for the specific channel
    const processedTemplate = processTemplateForChannel(template, channelType);
    
    // Route to appropriate channel handler
    switch (channelType) {
      case 'email':
        return await openEmailWithTemplate(processedTemplate.subject || template.name, processedTemplate.body);
      case 'sms':
        return await openSmsWithTemplate(processedTemplate.body);
      case 'whatsapp':
        return await openWhatsAppWithTemplate(processedTemplate.body);
      default:
        throw new Error(`Unsupported channel type: ${channelType}`);
    }
  } catch (error) {
    console.error(`Error opening ${channelType} channel:`, error);
    toast.error(`Failed to open ${channelType.toUpperCase()} channel. Please check your device settings.`);
    return false;
  }
};

/**
 * Opens email client with template content
 * @param subject Email subject
 * @param body Email body
 * @returns Promise that resolves with success status
 */
export const openEmailWithTemplate = async (
  subject: string,
  body: string
): Promise<boolean> => {
  try {
    const mailtoUrl = encodeMailtoUrl(subject, body);
    window.location.href = mailtoUrl;
    toast.success('Email client opened successfully');
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
};

/**
 * Opens SMS app with template content
 * @param body SMS body content
 * @returns Promise that resolves with success status
 */
export const openSmsWithTemplate = async (body: string): Promise<boolean> => {
  try {
    // SMS URL scheme
    const encodedBody = encodeURIComponent(body);
    const smsUrl = `sms:?body=${encodedBody}`;
    window.location.href = smsUrl;
    toast.success('SMS app opened successfully');
    return true;
  } catch (error) {
    console.error('Error opening SMS app:', error);
    return false;
  }
};

/**
 * Opens WhatsApp with template content
 * @param body WhatsApp message content
 * @returns Promise that resolves with success status
 */
export const openWhatsAppWithTemplate = async (body: string): Promise<boolean> => {
  try {
    // WhatsApp URL scheme
    const encodedBody = encodeURIComponent(body);
    const whatsappUrl = `whatsapp://send?text=${encodedBody}`;
    
    // Try to open WhatsApp
    window.location.href = whatsappUrl;
    
    // Set a timeout to check if WhatsApp opened
    setTimeout(() => {
      // If page is still here after timeout, WhatsApp might not have opened
      // Offer fallback to web.whatsapp.com
      const fallbackUrl = `https://web.whatsapp.com/send?text=${encodedBody}`;
      toast.success('WhatsApp opened successfully');
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    return false;
  }
};