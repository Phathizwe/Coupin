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
 * Delete the redundant pricingPlans collection
 */
async function deletePricingPlansCollection() {
  try {
    console.log('Starting to delete the redundant pricingPlans collection...');
    
    // Get all documents in the pricingPlans collection
    const snapshot = await db.collection('pricingPlans').get();
    
    if (snapshot.empty) {
      console.log('No documents found in pricingPlans collection. Nothing to delete.');
      return;
    }
    
    console.log(`Found ${snapshot.size} documents to delete.`);
    
    // Delete each document in a batch
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Successfully deleted all documents in the pricingPlans collection.');
    
    console.log('Note: In Firestore, collections without documents are automatically removed.');
    console.log('The pricingPlans collection should no longer appear in the Firestore console.');
    
  } catch (error) {
    console.error('Error deleting pricingPlans collection:', error);
    throw error;
  }
}

// Execute the function
deletePricingPlansCollection()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });