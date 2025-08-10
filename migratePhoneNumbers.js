// migratePhoneNumbers.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_px307ityLaMaEG-TqT-Ssz3CT-AhJ6Y",
  authDomain: "coupin-f35d2.firebaseapp.com",
  projectId: "coupin-f35d2",
  storageBucket: "coupin-f35d2.appspot.com",
  messagingSenderId: "757183919417",
  appId: "1:757183919417:web:6c0146510173250129a4e8",
  measurementId: "G-R0XYKGNZ9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Helper function to normalize phone numbers
 */
function normalizePhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\s+|-|\(|\)|\+/g, '');
}

/**
 * Migration script to add normalized phone fields to existing customer records
 */
async function migrateCustomerPhoneNumbers() {
  console.log('Starting phone number migration...');
  const customersRef = collection(db, 'customers');
  
  try {
    const snapshot = await getDocs(customersRef);
    console.log(`Found ${snapshot.docs.length} customer records to process`);
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const customerDoc of snapshot.docs) {
      const customerData = customerDoc.data();
      
      // Skip if no phone number or already has normalized field
      if (!customerData.phone || customerData.phone_normalized) {
        skipped++;
        continue;
      }
      
      try {
        // Add normalized phone field
        const normalizedPhone = normalizePhoneNumber(customerData.phone);
        console.log(`Normalizing phone: ${customerData.phone} -> ${normalizedPhone}`);
        
        await updateDoc(doc(db, 'customers', customerDoc.id), {
          phone_normalized: normalizedPhone
        });
        updated++;
        
        // Log progress every 10 documents
        if (updated % 10 === 0) {
          console.log(`Progress: ${updated} customers updated`);
        }
      } catch (error) {
        console.error(`Failed to update customer ${customerDoc.id}:`, error);
        failed++;
      }
    }
    
    console.log(`
      Migration complete:
      - ${updated} customers updated
      - ${skipped} customers skipped (no phone or already normalized)
      - ${failed} updates failed
    `);
    
    return { updated, skipped, failed };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

// Run the migration
migrateCustomerPhoneNumbers()
  .then(() => {
    console.log('Migration completed successfully');
    setTimeout(() => process.exit(0), 3000); // Give time for Firebase operations to complete
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });