import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin with your service account
// Note: You should have a service account key file in your project
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

/**
 * Delete both pricing collections to start fresh
 */
async function deleteAllPricingCollections() {
  try {
    console.log('Starting to delete pricing collections...');
    
    // Delete pricingPlans collection (without underscore)
    const oldPlansSnapshot = await db.collection('pricingPlans').get();
    if (!oldPlansSnapshot.empty) {
      console.log(`Found ${oldPlansSnapshot.size} documents in pricingPlans collection.`);
      
      const batch1 = db.batch();
      oldPlansSnapshot.docs.forEach(doc => {
        batch1.delete(doc.ref);
      });
      
      await batch1.commit();
      console.log('Successfully deleted all documents in the pricingPlans collection.');
    } else {
      console.log('No documents found in pricingPlans collection.');
    }
    
    // Delete pricing_plans collection (with underscore)
    const newPlansSnapshot = await db.collection('pricing_plans').get();
    if (!newPlansSnapshot.empty) {
      console.log(`Found ${newPlansSnapshot.size} documents in pricing_plans collection.`);
      
      const batch2 = db.batch();
      newPlansSnapshot.docs.forEach(doc => {
        batch2.delete(doc.ref);
      });
      
      await batch2.commit();
      console.log('Successfully deleted all documents in the pricing_plans collection.');
    } else {
      console.log('No documents found in pricing_plans collection.');
    }
    
    console.log('Both collections have been cleared.');
    
  } catch (error) {
    console.error('Error deleting collections:', error);
    throw error;
  }
}

// Execute the function
deleteAllPricingCollections()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });