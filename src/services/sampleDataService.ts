import { Customer } from '../types';

// This file previously contained sample customer data functionality that has been removed.
// All data must be fetched from Firebase Firestore to ensure no dummy data is used.

// Function intentionally left empty to prevent any sample data usage
export const addSampleCustomers = async (businessId: string) => {
  console.warn('Sample data functionality has been removed. All data must come from Firebase Firestore.');
  throw new Error('Sample data functionality has been disabled. All data must come from Firebase Firestore.');
};