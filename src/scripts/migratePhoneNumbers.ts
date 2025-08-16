/**
 * Migration script to add normalized phone fields to existing customer records
 */
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhoneNumber } from '../utils/phoneUtils';

/**
 * Migrate customer phone numbers to normalized format
 */
export const migrateCustomerPhoneNumbers = async (): Promise<void> => {
  console.log('🔄 Starting phone number migration...');
  
  try {
    // Get all customer records
    const customersRef = collection(db, 'customers');
    const snapshot = await getDocs(customersRef);
    
    if (snapshot.empty) {
      console.log('ℹ️ No customers found to migrate');
      return;
    }
    
    console.log(`📋 Found ${snapshot.size} customer records to process`);
    
    // Use batched writes for efficiency
    const batchSize = 500;
    let batch = writeBatch(db);
    let operationCount = 0;
    let totalUpdated = 0;
    
    for (const customerDoc of snapshot.docs) {
      const customerData = customerDoc.data();
      
      // Skip if no phone number
      if (!customerData.phone) {
        console.log(`⚠️ Customer ${customerDoc.id} has no phone number, skipping`);
        continue;
      }
      
      // Normalize the phone number
      const originalPhone = customerData.phone;
      const normalizedPhone = normalizePhoneNumber(originalPhone);
      
      // Skip if already normalized
      if (originalPhone === normalizedPhone) {
        console.log(`✅ Customer ${customerDoc.id} phone already normalized: ${normalizedPhone}`);
        continue;
      }
      
      console.log(`🔄 Normalizing ${customerDoc.id}: ${originalPhone} → ${normalizedPhone}`);
      
      // Add to batch
      const customerRef = doc(db, 'customers', customerDoc.id);
      batch.update(customerRef, { 
        phone: normalizedPhone,
        originalPhone: originalPhone, // Keep original for reference
        updatedAt: new Date()
      });
      
      operationCount++;
      totalUpdated++;
      
      // Commit batch when it reaches the limit
      if (operationCount >= batchSize) {
        console.log(`🔄 Committing batch of ${operationCount} updates...`);
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      console.log(`🔄 Committing final batch of ${operationCount} updates...`);
      await batch.commit();
    }
    
    console.log(`✅ Migration complete! Updated ${totalUpdated} customer records`);
  } catch (error) {
    console.error('❌ Error during phone number migration:', error);
    throw error;
  }
};

// Execute the migration if run directly
if (require.main === module) {
  migrateCustomerPhoneNumbers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}