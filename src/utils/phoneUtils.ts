/**
 * Phone number normalization utilities
 * Handles various South African phone number formats
 */

/**
 * Normalize a phone number to a consistent format
 * Handles various formats like:
 * - 0832091122
 * - 083 209 1122
 * - +27832091122
 * - (083) 209 1122
 * - 27832091122
 * 
 * @param phone The phone number to normalize
 * @returns The normalized phone number in international format (+27...)
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle South African numbers
  if (digitsOnly.startsWith('27')) {
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0')) {
    return `+27${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 9) {
    return `+27${digitsOnly}`;
  }
  
  return `+27${digitsOnly}`;
};

/**
 * Format a phone number for display (local format)
 * 
 * @param phone The phone number to format
 * @returns The formatted phone number for display (0...)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.startsWith('+27')) {
    return `0${normalized.substring(3)}`;
  }
  return phone;
};

/**
 * Check if two phone numbers match after normalization
 * 
 * @param phone1 First phone number
 * @param phone2 Second phone number
 * @returns True if the phone numbers match after normalization
 */
export const phoneNumbersMatch = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2);
};