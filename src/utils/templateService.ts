import { CommunicationTemplate } from '../types';

/**
 * Gets the first available template of a specific type
 * @param templates List of templates
 * @param type Template type to filter by
 * @returns First matching template or undefined if none found
 */
export const getFirstTemplateByType = (
  templates: CommunicationTemplate[],
  type: string
): CommunicationTemplate | undefined => {
  return templates.find(template => template.type === type);
};

/**
 * Gets templates suitable for WhatsApp
 * @param templates List of templates
 * @returns Templates that can be used with WhatsApp
 */
export const getWhatsAppCompatibleTemplates = (
  templates: CommunicationTemplate[]
): CommunicationTemplate[] => {
  return templates.filter(template => 
    template.type === 'whatsapp' || 
    template.type === 'sms'
  );
};

/**
 * Formats a template for WhatsApp
 * @param template Template to format
 * @param customerName Optional customer name for personalization
 * @returns Formatted template content
 */
export const formatTemplateForWhatsApp = (
  template: CommunicationTemplate,
  customerName?: string
): string => {
  let content = template.content;
  
  // Replace common variables
  if (customerName) {
    content = content.replace(/\{customerName\}/g, customerName);
  }
  
  // Replace other variables with placeholder text
  content = content.replace(/\{([^}]+)\}/g, '___');
  
  return content;
};