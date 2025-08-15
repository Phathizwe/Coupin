/**
 * Utility functions for handling phone numbers
 */

/**
 * Normalize a phone number by removing all non-digit characters
 * Handles various formats like:
 * - 0832091122
 * - 083 209 1122
 * - +27832091122
 * - (083) 209 1122
 * - 0027832091122
 * 
 * @param phone The phone number to normalize
 * @returns The normalized phone number (digits only)
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

/**
 * Compare two phone numbers to check if they match, regardless of format
 * 
 * @param phone1 First phone number
 * @param phone2 Second phone number
 * @returns True if the phone numbers match after normalization
 */
export const phoneNumbersMatch = (phone1: string, phone2: string): boolean => {
  if (!phone1 || !phone2) return false;
  
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  if (normalized1 === normalized2) return true;
  
  // Check for country code differences (e.g., +27 vs 0 for South Africa)
  // This handles cases where one number has country code and the other doesn't
  if (normalized1.startsWith('27') && normalized2.startsWith('0')) {
    return normalized1.substring(2) === normalized2.substring(1);
  }
  
  if (normalized2.startsWith('27') && normalized1.startsWith('0')) {
    return normalized2.substring(2) === normalized1.substring(1);
  }
  
  return false;
};

/**
 * Format a phone number for display
 * 
 * @param phone The phone number to format
 * @returns The formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const normalized = normalizePhoneNumber(phone);
  
  // Format based on length and first digits
  if (normalized.startsWith('27') && normalized.length >= 11) {
    // South African format with country code: +27 83 209 1122
    return `+${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 7)} ${normalized.substring(7)}`;
  } else if (normalized.startsWith('0') && normalized.length >= 10) {
    // South African format without country code: 083 209 1122
    return `${normalized.substring(0, 3)} ${normalized.substring(3, 6)} ${normalized.substring(6)}`;
  }
  
  // Default formatting for other numbers
  return normalized.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};