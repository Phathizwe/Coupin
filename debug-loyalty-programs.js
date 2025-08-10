const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugLoyaltyPrograms() {
  try {
    console.log('=== DEBUGGING LOYALTY PROGRAMS ===');

    // Check if loyaltyPrograms collection exists and has any documents
    const loyaltyProgramsRef = db.collection('loyaltyPrograms');
    const allPrograms = await loyaltyProgramsRef.get();

    console.log(`Total loyalty programs in database: ${allPrograms.size}`);

    if (allPrograms.empty) {
      console.log('❌ No loyalty programs found in the entire collection');
      return;
    }

    console.log('\n=== ALL LOYALTY PROGRAMS ===');
    allPrograms.forEach(doc => {
      const data = doc.data();
      console.log(`Program ID: ${doc.id}`);
      console.log(`Business ID: ${data.businessId}`);
      console.log(`Program Name: ${data.name || 'No name'}`);
      console.log(`Created At: ${data.createdAt ? data.createdAt.toDate() : 'No date'}`);
      console.log('---');
    });

    // Check specifically for the corrected businessId
    const correctedBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe';
    console.log(`\n=== CHECKING FOR BUSINESS ID: ${correctedBusinessId} ===`);

    const businessPrograms = await loyaltyProgramsRef
      .where('businessId', '==', correctedBusinessId)
      .get();

    console.log(`Programs found for corrected businessId: ${businessPrograms.size}`);

    if (!businessPrograms.empty) {
      businessPrograms.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Found program: ${doc.id}`);
        console.log(`Program data:`, JSON.stringify(data, null, 2));
      });
    } else {
      console.log('❌ No programs found for corrected businessId');
    }

    // Check for the original businessId too
    const originalBusinessId = 'Mt8ZZpQXyXMt2IEAOKNe';
    console.log(`\n=== CHECKING FOR ORIGINAL BUSINESS ID: ${originalBusinessId} ===`);

    const originalBusinessPrograms = await loyaltyProgramsRef
      .where('businessId', '==', originalBusinessId)
      .get();

    console.log(`Programs found for original businessId: ${originalBusinessPrograms.size}`);

    if (!originalBusinessPrograms.empty) {
      originalBusinessPrograms.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Found program: ${doc.id}`);
        console.log(`Program data:`, JSON.stringify(data, null, 2));
      });
    } else {
      console.log('❌ No programs found for original businessId');
    }

    // Check what businessIds actually exist
    console.log('\n=== ALL UNIQUE BUSINESS IDs IN LOYALTY PROGRAMS ===');
    const uniqueBusinessIds = new Set();
    allPrograms.forEach(doc => {
      const data = doc.data();
      if (data.businessId) {
        uniqueBusinessIds.add(data.businessId);
      }
    });

    console.log('Unique businessIds found:');
    uniqueBusinessIds.forEach(id => {
      console.log(`- ${id}`);
    });

  } catch (error) {
    console.error('Error debugging loyalty programs:', error);
  } finally {
    process.exit(0);
  }
}

debugLoyaltyPrograms();