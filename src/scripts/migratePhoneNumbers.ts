// src/scripts/migratePhoneNumbers.ts
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { QueryOptimizer } from '../services/firestore/optimizers/queryOptimizer';

/**
 * Migration script to add normalized phone fields to existing customer records
 */
export async function migrateCustomerPhoneNumbers() {
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
      const normalizedPhone = QueryOptimizer.normalizePhoneNumber(customerData.phone);
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