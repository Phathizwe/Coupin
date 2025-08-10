const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function comprehensiveDebug() {
  try {
    console.log('=== COMPREHENSIVE FIRESTORE DEBUG ===');

    // List all collections in the database
    console.log('\n=== ALL COLLECTIONS IN DATABASE ===');
    const collections = await db.listCollections();
    console.log('Collections found:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });

    // Check if loyaltyPrograms collection exists
    const loyaltyProgramsExists = collections.some(col => col.id === 'loyaltyPrograms');
    console.log(`\nloyaltyPrograms collection exists: ${loyaltyProgramsExists}`);

    if (loyaltyProgramsExists) {
      // Check loyaltyPrograms collection
      console.log('\n=== LOYALTY PROGRAMS COLLECTION ===');
      const loyaltyProgramsRef = db.collection('loyaltyPrograms');
      const allPrograms = await loyaltyProgramsRef.get();

      console.log(`Total loyalty programs: ${allPrograms.size}`);

      if (!allPrograms.empty) {
        console.log('\n=== ALL LOYALTY PROGRAMS ===');
        allPrograms.forEach(doc => {
          const data = doc.data();
          console.log(`Program ID: ${doc.id}`);
          console.log(`Business ID: ${data.businessId}`);
          console.log(`Program Name: ${data.name || 'No name'}`);
          console.log(`Created At: ${data.createdAt ? data.createdAt.toDate() : 'No date'}`);
          console.log('Full data:', JSON.stringify(data, null, 2));
          console.log('---');
        });

        // Check for both businessIds
        const originalBusinessId = 'Mt8ZZpQXyXMt2IEAOKNe';
        const correctedBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe';

        console.log(`\n=== CHECKING FOR ORIGINAL BUSINESS ID: ${originalBusinessId} ===`);
        const originalPrograms = await loyaltyProgramsRef
          .where('businessId', '==', originalBusinessId)
          .get();
        console.log(`Programs found: ${originalPrograms.size}`);

        console.log(`\n=== CHECKING FOR CORRECTED BUSINESS ID: ${correctedBusinessId} ===`);
        const correctedPrograms = await loyaltyProgramsRef
          .where('businessId', '==', correctedBusinessId)
          .get();
        console.log(`Programs found: ${correctedPrograms.size}`);

        // Show unique businessIds
        console.log('\n=== ALL UNIQUE BUSINESS IDs ===');
        const uniqueBusinessIds = new Set();
        allPrograms.forEach(doc => {
          const data = doc.data();
          if (data.businessId) {
            uniqueBusinessIds.add(data.businessId);
          }
        });

        uniqueBusinessIds.forEach(id => {
          console.log(`- ${id}`);
        });
      }
    }

    // Check recent writes to see if anything was created recently
    console.log('\n=== CHECKING FOR RECENT ACTIVITY ===');
    try {
      // Check if there are any documents created in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (loyaltyProgramsExists) {
        const recentPrograms = await db.collection('loyaltyPrograms')
          .where('createdAt', '>=', oneHourAgo)
          .get();

        console.log(`Recent loyalty programs (last hour): ${recentPrograms.size}`);

        if (!recentPrograms.empty) {
          recentPrograms.forEach(doc => {
            const data = doc.data();
            console.log(`Recent program: ${doc.id}`);
            console.log(`Business ID: ${data.businessId}`);
            console.log(`Created: ${data.createdAt ? data.createdAt.toDate() : 'No date'}`);
          });
        }
      }
    } catch (error) {
      console.log('Could not check recent activity:', error.message);
    }

  } catch (error) {
    console.error('Error in comprehensive debug:', error);
  } finally {
    process.exit(0);
  }
}

comprehensiveDebug();