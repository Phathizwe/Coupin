import { Currency, Region } from './types';

/**
 * Get default currencies as fallback
 */
export function getDefaultCurrencies(): Currency[] {
  return [
    { code: "USD", name: "US Dollar", symbol: "$", isActive: true },
    { code: "EUR", name: "Euro", symbol: "€", isActive: true },
    { code: "GBP", name: "British Pound", symbol: "£", isActive: true },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", isActive: true },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", isActive: true },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", isActive: true },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", isActive: true },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", isActive: true },
    { code: "INR", name: "Indian Rupee", symbol: "₹", isActive: true },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", isActive: true },
  ];
}

/**
 * Get default regions as fallback
 */
export function getDefaultRegions(): Region[] {
  return [
    { code: "US", name: "United States", flag: "🇺🇸", currencies: ["USD"], isActive: true },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", currencies: ["GBP"], isActive: true },
    { code: "DE", name: "Germany", flag: "🇩🇪", currencies: ["EUR"], isActive: true },
    { code: "FR", name: "France", flag: "🇫🇷", currencies: ["EUR"], isActive: true },
    { code: "JP", name: "Japan", flag: "🇯🇵", currencies: ["JPY"], isActive: true },
    { code: "CA", name: "Canada", flag: "🇨🇦", currencies: ["CAD"], isActive: true },
    { code: "AU", name: "Australia", flag: "🇦🇺", currencies: ["AUD"], isActive: true },
    { code: "CH", name: "Switzerland", flag: "🇨🇭", currencies: ["CHF"], isActive: true },
    { code: "CN", name: "China", flag: "🇨🇳", currencies: ["CNY"], isActive: true },
    { code: "IN", name: "India", flag: "🇮🇳", currencies: ["INR"], isActive: true },
    { code: "BR", name: "Brazil", flag: "🇧🇷", currencies: ["BRL"], isActive: true },
  ];
}

/**
 * Get default currency for a region
 */
export function getDefaultCurrencyForRegion(regionCode: string): string {
  const regionCurrencyMap: Record<string, string> = {
    'US': 'USD',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'JP': 'JPY',
    'CA': 'CAD',
    'AU': 'AUD',
    'CH': 'CHF',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
  };
  
  return regionCurrencyMap[regionCode] || 'USD';
}