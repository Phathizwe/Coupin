// src/scripts/migratePhoneNumbers.js
const { collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { db } = require('../../src/config/firebase');

/**
 * Helper function to normalize phone numbers
 */
function normalizePhoneNumber(phone) {
  return phone.replace(/\s+|-|\(|\)|\+/g, '');
}

/**
 * Migration script to add normalized phone fields to existing customer records
 */
async function migrateCustomerPhoneNumbers() {
  console.log('Starting phone number migration...');
  const customersRef = collection(db, 'customers');
  const snapshot = await getDocs(customersRef);
  
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
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCustomerPhoneNumbers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateCustomerPhoneNumbers };