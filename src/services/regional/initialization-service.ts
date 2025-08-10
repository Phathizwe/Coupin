import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CURRENCIES_COLLECTION, REGIONS_COLLECTION } from './types';
import { getDefaultCurrencies, getDefaultRegions } from './default-data';

/**
 * Initialize default currencies if none exist
 */
export async function initializeDefaultCurrencies(): Promise<void> {
  try {
    console.log('Initializing default currencies in Firestore...');
    const defaultCurrencies = getDefaultCurrencies();
    
    // Create batch operations to add all currencies
    const batch = Promise.all(
      defaultCurrencies.map(currency => 
        setDoc(doc(db, CURRENCIES_COLLECTION, currency.code), {
          name: currency.name,
          symbol: currency.symbol,
          isActive: true,
          updatedAt: Timestamp.now(),
          updatedBy: 'system'
        })
      )
    );
    
    await batch;
    console.log('Default currencies initialized successfully');
  } catch (error) {
    console.error('Error initializing default currencies:', error);
    console.log('Continuing with local default currencies');
  }
}

/**
 * Initialize default regions if none exist
 */
export async function initializeDefaultRegions(): Promise<void> {
  try {
    console.log('Initializing default regions in Firestore...');
    const defaultRegions = getDefaultRegions();
    
    // Create batch operations to add all regions
    const batch = Promise.all(
      defaultRegions.map(region => 
        setDoc(doc(db, REGIONS_COLLECTION, region.code), {
          name: region.name,
          flag: region.flag,
          currencies: region.currencies,
          isActive: true,
          updatedAt: Timestamp.now(),
          updatedBy: 'system'
        })
      )
    );
    
    await batch;
    console.log('Default regions initialized successfully');
  } catch (error) {
    console.error('Error initializing default regions:', error);
    console.log('Continuing with local default regions');
  }
}