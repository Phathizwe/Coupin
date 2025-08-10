import { CommunicationTemplate } from '../types';

/**
 * Interface for parsed template components
 */
interface ParsedTemplate {
  subject?: string;
  body: string;
  variables: string[];
}

/**
 * Processes a template for SMS channel
 * @param template The template to process
 * @returns Processed template content
 */
export const processSmsTemplate = (template: CommunicationTemplate): ParsedTemplate => {
  let content = template.content;
  
  // Remove channel tag if present
  content = content.replace(/^\[SMS\]|\[sms\]/i, '').trim();
  
  // Extract variables
  const variables = extractVariables(content);
  
  // Truncate if necessary (SMS limit is 160 chars)
  if (content.length > 160) {
    content = content.substring(0, 157) + '...';
  }
  
  return {
    body: content,
    variables
  };
};

/**
 * Processes a template for Email channel
 * @param template The template to process
 * @returns Processed template with subject and body
 */
export const processEmailTemplate = (template: CommunicationTemplate): ParsedTemplate => {
  let content = template.content;
  let subject = template.subject || '';
  
  // Remove channel tag if present
  content = content.replace(/^\[EMAIL\]|\[email\]/i, '').trim();
  
  // Extract subject from content if not provided
  if (!subject) {
    const lines = content.split('\n');
    const subjectLineIndex = lines.findIndex(line => 
      line.trim().toLowerCase().startsWith('subject:')
    );
    
    if (subjectLineIndex >= 0) {
      const subjectLine = lines[subjectLineIndex];
      subject = subjectLine.substring(subjectLine.indexOf(':') + 1).trim();
      
      // Remove the subject line from content
      lines.splice(subjectLineIndex, 1);
      content = lines.join('\n').trim();
    }
  }
  
  // Extract variables
  const variables = extractVariables(content);
  
  return {
    subject,
    body: content,
    variables
  };
};

/**
 * Processes a template for WhatsApp channel
 * @param template The template to process
 * @returns Processed template content
 */
export const processWhatsAppTemplate = (template: CommunicationTemplate): ParsedTemplate => {
  let content = template.content;
  
  // Remove channel tag if present
  content = content.replace(/^\[WHATSAPP\]|\[whatsapp\]/i, '').trim();
  
  // Extract variables
  const variables = extractVariables(content);
  
  // Preserve line breaks and formatting for WhatsApp
  
  return {
    body: content,
    variables
  };
};

/**
 * Extracts variables from template content
 * @param content The template content
 * @returns Array of variable names
 */
export const extractVariables = (content: string): string[] => {
  const variableRegex = /\{([^}]+)\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
};

/**
 * Process template based on channel type
 * @param template The template to process
 * @param channelType The channel type
 * @returns Processed template
 */
export const processTemplateForChannel = (
  template: CommunicationTemplate,
  channelType: 'email' | 'sms' | 'whatsapp'
): ParsedTemplate => {
  switch (channelType) {
    case 'email':
      return processEmailTemplate(template);
    case 'sms':
      return processSmsTemplate(template);
    case 'whatsapp':
      return processWhatsAppTemplate(template);
    default:
      // Default to basic processing
      return {
        body: template.content,
        variables: extractVariables(template.content)
      };
  }
};