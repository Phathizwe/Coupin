import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin with your service account
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

/**
 * Migrate data from the old pricingPlans collection to the new pricing_plans collection
 */
async function migratePricingPlansCollection() {
  try {
    console.log('Starting migration from pricingPlans to pricing_plans...');
    
    // Get all documents from the old collection
    const oldSnapshot = await db.collection('pricingPlans').get();
    
    if (oldSnapshot.empty) {
      console.log('No documents found in the old pricingPlans collection. Nothing to migrate.');
      return;
    }
    
    console.log(`Found ${oldSnapshot.size} documents to migrate.`);
    
    // Check if documents already exist in the new collection
    const newSnapshot = await db.collection('pricing_plans').get();
    
    if (!newSnapshot.empty) {
      console.log(`Warning: The new pricing_plans collection already has ${newSnapshot.size} documents.`);
      const proceed = await promptUser('Do you want to proceed with migration? This might create duplicate data. (y/n): ');
      
      if (proceed.toLowerCase() !== 'y') {
        console.log('Migration cancelled by user.');
        return;
      }
    }
    
    // Migrate each document
    const batch = db.batch();
    let migratedCount = 0;
    
    for (const doc of oldSnapshot.docs) {
      const data = doc.data();
      const newDocRef = db.collection('pricing_plans').doc(doc.id);
      
      batch.set(newDocRef, {
        ...data,
        migratedAt: new Date(),
        active: true // Ensure the plan is active
      });
      
      migratedCount++;
      
      // Firestore batches can only contain up to 500 operations
      if (migratedCount % 400 === 0) {
        await batch.commit();
        console.log(`Migrated ${migratedCount} documents so far...`);
      }
    }
    
    // Commit any remaining operations
    if (migratedCount % 400 !== 0) {
      await batch.commit();
    }
    
    console.log(`Successfully migrated ${migratedCount} documents to the pricing_plans collection.`);
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Simple function to prompt user for input
function promptUser(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Execute the function
migratePricingPlansCollection()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });