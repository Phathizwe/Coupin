/**
 * Utility functions for phone number handling
 */
export const phoneUtils = {
  // Normalize phone number for comparison by removing all non-digit characters
  normalizePhoneForComparison: (phone: string): string => {
    return phone.replace(/\D/g, '');
  },

  // Generate all possible phone number formats for search
  generatePhoneFormats: (phone: string): string[] => {
    const normalized = phone.replace(/\D/g, '');
    const possibleFormats = [];
    
    // Always include the normalized input
    possibleFormats.push(normalized);
    
    // If the number starts with a country code (e.g., 27 for South Africa)
    if (normalized.startsWith('27') && normalized.length > 9) {
      // Without country code (with leading 0)
      possibleFormats.push('0' + normalized.substring(2)); // e.g., 0832091122
      // Without country code and without leading 0
      possibleFormats.push(normalized.substring(2)); // e.g., 832091122
    }
    
    // If it starts with 0 (local format), also try with country code
    if (normalized.startsWith('0') && normalized.length > 9) {
      // With country code (27 for South Africa)
      possibleFormats.push('27' + normalized.substring(1)); // e.g., 27832091122
    }
    
    // If it doesn't start with 0 or 27, try both formats
    if (!normalized.startsWith('0') && !normalized.startsWith('27') && normalized.length > 8) {
      // Try with leading 0
      possibleFormats.push('0' + normalized); // e.g., 0832091122
      // Try with country code
      possibleFormats.push('27' + normalized); // e.g., 27832091122
    }
    
    // Add international formats
    possibleFormats.push('+' + (normalized.startsWith('27') ? normalized : '27' + normalized.replace(/^0/, '')));
    possibleFormats.push('00' + (normalized.startsWith('27') ? normalized : '27' + normalized.replace(/^0/, '')));
    
    return possibleFormats;
  },

  // Check if two phone numbers match, considering different formats
  phoneNumbersMatch: (phone1: string, phone2: string): boolean => {
    const normalized1 = phone1.replace(/\D/g, '');
    const normalized2 = phone2.replace(/\D/g, '');
    
    // Direct match
    if (normalized1 === normalized2) return true;
    
    // South Africa specific matching logic
    // If one starts with 27 and the other with 0
    if (normalized1.startsWith('27') && normalized2.startsWith('0')) {
      return normalized1.substring(2) === normalized2.substring(1);
    }
    
    if (normalized2.startsWith('27') && normalized1.startsWith('0')) {
      return normalized2.substring(2) === normalized1.substring(1);
    }
    
    // If one has no prefix and the other starts with 0
    if (!normalized1.startsWith('0') && !normalized1.startsWith('27') && normalized2.startsWith('0')) {
      return normalized1 === normalized2.substring(1);
    }
    
    if (!normalized2.startsWith('0') && !normalized2.startsWith('27') && normalized1.startsWith('0')) {
      return normalized2 === normalized1.substring(1);
    }
    
    // If one has no prefix and the other starts with 27
    if (!normalized1.startsWith('0') && !normalized1.startsWith('27') && normalized2.startsWith('27')) {
      return normalized1 === normalized2.substring(2);
    }
    
    if (!normalized2.startsWith('0') && !normalized2.startsWith('27') && normalized1.startsWith('27')) {
      return normalized2 === normalized1.substring(2);
    }
    
    // Check if one is a substring of the other (for partial matches)
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }
};