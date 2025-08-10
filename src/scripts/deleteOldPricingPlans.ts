import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

async function deleteOldPricingPlans() {
  try {
    console.log('Starting to delete old pricingPlans collection...');
    
    // Get all documents from the old collection
    const oldPlansRef = collection(db, 'pricingPlans');
    const snapshot = await getDocs(oldPlansRef);
    
    if (snapshot.empty) {
      console.log('No documents found in pricingPlans collection. Nothing to delete.');
      return;
    }
    
    console.log(`Found ${snapshot.size} documents to delete.`);
    
    // Delete each document
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('Successfully deleted all documents in the old pricingPlans collection.');
    console.log('The pricingPlans collection should no longer appear in the Firestore console.');
    
  } catch (error) {
    console.error('Error deleting old pricing plans:', error);
    throw error;
  }
}

// Execute the function
deleteOldPricingPlans()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });