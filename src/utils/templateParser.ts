import { CommunicationTemplate } from '../types';

/**
 * Interface for parsed email template components
 */
interface ParsedEmailTemplate {
  subject: string;
  body: string;
}

/**
 * Parses an email template to extract subject and body
 * @param template The email template to parse
 * @returns Object containing subject and body
 */
export const parseEmailTemplate = (template: CommunicationTemplate): ParsedEmailTemplate => {
  // If the template has a subject field, use it
  if (template.subject) {
    return {
      subject: template.subject,
      body: template.content
    };
  }
  
  // Otherwise, try to extract subject from content
  // Check if content starts with "Subject:" line
  const lines = template.content.split('\n');
  const subjectLineIndex = lines.findIndex(line => 
    line.trim().toLowerCase().startsWith('subject:')
  );
  
  if (subjectLineIndex >= 0) {
    const subjectLine = lines[subjectLineIndex];
    const subject = subjectLine.substring(subjectLine.indexOf(':') + 1).trim();
    
    // Remove the subject line from content to get body
    const bodyLines = [...lines];
    bodyLines.splice(subjectLineIndex, 1);
    const body = bodyLines.join('\n').trim();
    
    return { subject, body };
  }
  
  // If no subject found, use template name as subject
  return {
    subject: template.name,
    body: template.content
  };
};

/**
 * Formats a template for email
 * @param template Template to format
 * @param customerName Optional customer name for personalization
 * @returns Formatted template content
 */
export const formatTemplateForEmail = (
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