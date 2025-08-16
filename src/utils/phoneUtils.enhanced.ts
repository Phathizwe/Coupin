/**
 * Enhanced phone number utilities
 * Improved handling of South African phone numbers with better validation
 */

/**
 * Normalize a phone number to a consistent international format
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
  if (!phone) {
    console.log('⚠️ [PHONE UTILS] Empty phone number provided');
    return '';
  }
  
  console.log('🔍 [PHONE UTILS] Normalizing phone number:', phone);
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  console.log('🔍 [PHONE UTILS] Digits only:', digitsOnly);
  
  let normalizedPhone = '';
  
  // Handle South African numbers
  if (digitsOnly.startsWith('27')) {
    normalizedPhone = `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0')) {
    normalizedPhone = `+27${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 9) {
    // This is likely just the 9 digits after the country code
    normalizedPhone = `+27${digitsOnly}`;
  } else if (digitsOnly.length === 10 && !digitsOnly.startsWith('0')) {
    // This might be a 10-digit number without leading 0
    normalizedPhone = `+27${digitsOnly.substring(1)}`;
  } else {
    // Default case - just add +27 prefix
    normalizedPhone = `+27${digitsOnly}`;
  }
  
  console.log('✅ [PHONE UTILS] Normalized phone:', normalizedPhone);
  return normalizedPhone;
};

/**
 * Validate a phone number to ensure it's a valid South African number
 * 
 * @param phone The phone number to validate
 * @returns True if the phone number is valid
 */
export const isValidSouthAfricanPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Normalize the phone number first
  const normalized = normalizePhoneNumber(phone);
  
  // Check if it matches South African format
  // +27 followed by 9 digits
  const isValid = /^\+27\d{9}$/.test(normalized);
  
  console.log('🔍 [PHONE UTILS] Phone validation result:', isValid);
  return isValid;
};

/**
 * Format a phone number for display (local format)
 * 
 * @param phone The phone number to format
 * @returns The formatted phone number for display (0...)
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  
  if (!normalized) return '';
  
  if (normalized.startsWith('+27')) {
    return `0${normalized.substring(3)}`;
  }
  
  return phone;
};

/**
 * Format a phone number with spaces for better readability
 * 
 * @param phone The phone number to format
 * @returns The formatted phone number with spaces (083 209 1122)
 */
export const formatPhoneWithSpaces = (phone: string): string => {
  const localFormat = formatPhoneForDisplay(phone);
  
  if (!localFormat || localFormat.length < 10) return localFormat;
  
  // Format as 083 209 1122
  return `${localFormat.substring(0, 3)} ${localFormat.substring(3, 6)} ${localFormat.substring(6)}`;
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
  
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  const match = normalized1 === normalized2;
  console.log('🔍 [PHONE UTILS] Phone number comparison:', { 
    phone1, 
    phone2, 
    normalized1, 
    normalized2, 
    match 
  });
  
  return match;
};

/**
 * Generate alternative formats for a phone number to help with lookups
 * 
 * @param phone The phone number to generate alternatives for
 * @returns Array of alternative phone number formats
 */
export const generatePhoneAlternatives = (phone: string): string[] => {
  if (!phone) return [];
  
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return [];
  
  const alternatives = [
    normalized,                           // +27832091122
    normalized.replace(/^\+/, ''),        // 27832091122
    `0${normalized.substring(3)}`,        // 0832091122
    normalized.substring(3),              // 832091122
  ];
  
  console.log('🔍 [PHONE UTILS] Generated phone alternatives:', alternatives);
  return alternatives;
};