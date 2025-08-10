import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { PricingPlan } from '../types/billing.types';

/**
 * Utility function to delete all documents in a collection
 * @param collectionName The name of the collection to delete
 * @returns Promise that resolves when all documents are deleted
 */
export const deleteCollection = async (collectionName: string): Promise<void> => {
  try {
    console.log(`Starting to delete ${collectionName} collection...`);
    
    // Get all documents from the collection
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName} collection. Nothing to delete.`);
      return;
    }
    
    console.log(`Found ${snapshot.size} documents to delete.`);
    
    // Delete each document
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Successfully deleted all documents in the ${collectionName} collection.`);
    
  } catch (error) {
    console.error(`Error deleting ${collectionName} collection:`, error);
    throw error;
  }
};

/**
 * Utility function to migrate pricing plans from old collection to new collection
 */
export const migratePricingPlans = async (): Promise<void> => {
  try {
    // Get all documents from the old collection
    const oldPlansRef = collection(db, 'pricingPlans');
    const oldPlansSnapshot = await getDocs(oldPlansRef);
    
    if (oldPlansSnapshot.empty) {
      console.log('No documents found in old pricingPlans collection.');
      return;
    }
    
    console.log(`Found ${oldPlansSnapshot.size} plans to migrate.`);
    
    // Create new collection with the plans, adding the active flag
    const newPlansRef = collection(db, 'pricing_plans');
    
    for (const doc of oldPlansSnapshot.docs) {
      const planData = doc.data() as Omit<PricingPlan, 'id'>;
      
      // Add the active flag if it doesn't exist
      if (planData.active === undefined) {
        planData.active = true;
      }
      
      // Add to the new collection
      await addDoc(newPlansRef, {
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Successfully migrated pricing plans to the new collection.');
    
  } catch (error) {
    console.error('Error migrating pricing plans:', error);
    throw error;
  }
};