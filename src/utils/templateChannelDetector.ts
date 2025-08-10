import { CommunicationTemplate } from '../types';

/**
 * Detects the channel type based on template content and metadata
 * @param template The template to analyze
 * @returns The detected channel type or null if unable to determine
 */
export const detectTemplateChannel = (template: CommunicationTemplate): 'email' | 'sms' | 'whatsapp' | null => {
  // 1. Use the template's explicit type if available
  if (template.type) {
    return template.type;
  }
  
  // 2. Check for explicit channel tags in content
  const content = template.content.trim();
  
  if (content.startsWith('[EMAIL]') || content.startsWith('[email]')) {
    return 'email';
  }
  
  if (content.startsWith('[SMS]') || content.startsWith('[sms]')) {
    return 'sms';
  }
  
  if (content.startsWith('[WHATSAPP]') || content.startsWith('[whatsapp]')) {
    return 'whatsapp';
  }
  
  // 3. Content analysis as fallback
  
  // If it has a subject line, likely an email
  if (template.subject || content.includes('Subject:')) {
    return 'email';
  }
  
  // If it contains emojis, likely WhatsApp
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(content)) {
    return 'whatsapp';
  }
  
  // If it's very short (under 160 chars), likely SMS
  if (content.length <= 160) {
    return 'sms';
  }
  
  // If it's longer but not too long, could be WhatsApp
  if (content.length <= 1000) {
    return 'whatsapp';
  }
  
  // If it's very long or has HTML, likely email
  if (content.length > 1000 || /<[^>]*>/.test(content)) {
    return 'email';
  }
  
  // Unable to determine
  return null;
};

/**
 * Checks if a template is suitable for a specific channel
 * @param template The template to check
 * @param channelType The channel type to validate against
 * @returns Validation result with warnings if applicable
 */
export const validateTemplateForChannel = (
  template: CommunicationTemplate,
  channelType: 'email' | 'sms' | 'whatsapp'
): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  switch (channelType) {
    case 'sms':
      // Check SMS character limit
      if (template.content.length > 160) {
        warnings.push(`SMS length exceeds 160 characters (${template.content.length}). Message may be split or truncated.`);
      }
      break;
      
    case 'email':
      // Check if email has subject
      if (!template.subject && !template.content.includes('Subject:')) {
        warnings.push('Email template should have a subject line.');
      }
      break;
      
    case 'whatsapp':
      // Check WhatsApp character limit
      if (template.content.length > 4096) {
        warnings.push(`WhatsApp message exceeds 4096 characters (${template.content.length}). Message may be truncated.`);
      }
      break;
  }
  
  return {
    valid: true, // We'll always consider it valid but with warnings
    warnings
  };
};