/**
 * Currency utilities for South African localization
 */

// Format number to South African Rand
export const formatToRand = (amount: number): string => {
  return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
};

// Format number to South African Rand without decimals
export const formatToRandNoDecimals = (amount: number): string => {
  return `R${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
};

// Parse South African Rand string to number
export const parseRandValue = (randString: string): number => {
  if (!randString) return 0;
  return parseFloat(randString.replace(/[^\d.-]/g, ''));
};

// Format phone number to South African format
export const formatSAPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Handle different formats
  if (digitsOnly.startsWith('27')) {
    return `+${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 5)} ${digitsOnly.substring(5, 8)} ${digitsOnly.substring(8)}`;
  } else if (digitsOnly.startsWith('0')) {
    return `+27 ${digitsOnly.substring(1, 4)} ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`;
  }
  
  // Default format if pattern doesn't match
  return `+27 ${digitsOnly}`;
};