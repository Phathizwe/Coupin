const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupOrphanedAchievements() {
  try {
    console.log('=== CLEANING UP ORPHANED ACHIEVEMENTS ===');

    // Find all achievements with the placeholder businessId
    const orphanedQuery = await db.collection('loyaltyAchievements')
      .where('businessId', '==', 'business_id')
      .get();

    console.log(`Found ${orphanedQuery.size} orphaned achievements to clean up`);

    if (orphanedQuery.empty) {
      console.log('✅ No orphaned achievements found');
      return;
    }

    // Show some examples before deletion
    console.log('\n=== SAMPLE ORPHANED ACHIEVEMENTS ===');
    orphanedQuery.docs.slice(0, 5).forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.title} (Program: ${data.programId}, Created: ${data.createdAt ? data.createdAt.toDate() : 'No date'})`);
    });

    // Delete all orphaned achievements
    console.log('\n=== DELETING ORPHANED ACHIEVEMENTS ===');
    const batch = db.batch();

    orphanedQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Successfully deleted ${orphanedQuery.size} orphaned achievements`);

    // Verify cleanup
    const verifyQuery = await db.collection('loyaltyAchievements')
      .where('businessId', '==', 'business_id')
      .get();

    console.log(`\n=== VERIFICATION ===`);
    console.log(`Remaining orphaned achievements: ${verifyQuery.size}`);

    if (verifyQuery.size === 0) {
      console.log('✅ Cleanup successful - no orphaned achievements remain');
    } else {
      console.log('⚠️ Some orphaned achievements may still exist');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupOrphanedAchievements();