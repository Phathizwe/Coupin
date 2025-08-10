/**
 * Encodes a string for use in a URL
 * @param str String to encode
 * @returns URL encoded string
 */
export const encodeForUrl = (str: string): string => {
  return encodeURIComponent(str)
    // Additional encoding for special characters in mailto URLs
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/!/g, '%21');
};

/**
 * Creates a mailto URL with subject and body
 * @param subject Email subject
 * @param body Email body
 * @param to Optional recipient email
 * @returns Formatted mailto URL
 */
export const encodeMailtoUrl = (
  subject: string = '',
  body: string = '',
  to: string = ''
): string => {
  const encodedSubject = encodeForUrl(subject);
  const encodedBody = encodeForUrl(body);
  
  let url = 'mailto:';
  
  // Add recipient if provided
  if (to) {
    url += encodeForUrl(to);
  }
  
  // Add parameters if subject or body exists
  const params = [];
  
  if (subject) {
    params.push(`subject=${encodedSubject}`);
  }
  
  if (body) {
    params.push(`body=${encodedBody}`);
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  return url;
};