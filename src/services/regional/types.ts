import { Timestamp } from 'firebase/firestore';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface Region {
  code: string;
  name: string;
  flag: string;
  currencies: string[];
  isActive: boolean;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface UserRegionalPreferences {
  userId: string;
  region: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  updatedAt: Timestamp;
}

export const CURRENCIES_COLLECTION = 'currencies';
export const REGIONS_COLLECTION = 'regions';
export const USER_PREFERENCES_COLLECTION = 'userRegionalPreferences';