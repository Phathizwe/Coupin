/**
 * Normalizes a phone number for consistent storage and comparison
 * Keeps formatting characters for display purposes
 * 
 * @param phone The phone number to normalize
 * @returns Normalized phone number
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-numeric characters except + for international prefix
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // Format the phone number for display (this is a simple example and can be enhanced)
  if (cleanedPhone.startsWith('+')) {
    // International format
    if (cleanedPhone.length > 10) {
      const countryCode = cleanedPhone.substring(0, cleanedPhone.length - 10);
      const areaCode = cleanedPhone.substring(cleanedPhone.length - 10, cleanedPhone.length - 7);
      const firstPart = cleanedPhone.substring(cleanedPhone.length - 7, cleanedPhone.length - 4);
      const lastPart = cleanedPhone.substring(cleanedPhone.length - 4);
      return `${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
    }
  } else if (cleanedPhone.length === 10) {
    // Standard US/Canada format: (XXX) XXX-XXXX
    const areaCode = cleanedPhone.substring(0, 3);
    const firstPart = cleanedPhone.substring(3, 6);
    const lastPart = cleanedPhone.substring(6);
    return `(${areaCode}) ${firstPart}-${lastPart}`;
  }
  
  // If we can't format it nicely, just return the cleaned version
  return cleanedPhone;
};

/**
 * Extracts only digits from a phone number for database queries
 * 
 * @param phone The phone number to process
 * @returns String containing only digits
 */
export const getDigitsOnly = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};