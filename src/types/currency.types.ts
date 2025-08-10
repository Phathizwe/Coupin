import { Timestamp } from 'firebase/firestore';

/**
 * Interface representing a currency in the system
 */
export interface Currency {
  /**
   * ISO 4217 currency code (e.g., USD, EUR, GBP)
   */
  code: string;
  
  /**
   * Full name of the currency (e.g., US Dollar, Euro, British Pound)
   */
  name: string;
  
  /**
   * Currency symbol (e.g., $, €, £)
   */
  symbol: string;
  
  /**
   * Geographic region where the currency is primarily used
   * (e.g., North America, Europe, Asia-Pacific)
   */
  region?: string;
  
  /**
   * Whether the currency is active and available for use
   */
  isActive: boolean;
  
  /**
   * Timestamp when the currency was last updated
   */
  updatedAt?: Timestamp;
  
  /**
   * User ID who last updated the currency
   */
  updatedBy?: string;
}

/**
 * Default regions for grouping currencies
 */
export enum CurrencyRegion {
  NORTH_AMERICA = 'North America',
  EUROPE = 'Europe',
  ASIA_PACIFIC = 'Asia-Pacific',
  LATIN_AMERICA = 'Latin America',
  MIDDLE_EAST_AFRICA = 'Middle East & Africa',
  OTHER = 'Other'
}