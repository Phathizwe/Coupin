const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testLoyaltyProgramWrite() {
  try {
    console.log('=== TESTING LOYALTY PROGRAM WRITE ===');

    const testProgram = {
      businessId: 'Mt8ZZpQXyXOHzlEAOKNe',
      name: 'Test Loyalty Program',
      type: 'points',
      pointsPerDollar: 1,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Attempting to write test loyalty program...');

    // Try to create a test loyalty program
    const docRef = db.collection('loyaltyPrograms').doc();
    await docRef.set(testProgram);

    console.log('✅ Successfully wrote test loyalty program with ID:', docRef.id);

    // Verify it was written
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Test program verified in database');
      console.log('Data:', doc.data());

      // Clean up - delete the test program
      await docRef.delete();
      console.log('✅ Test program cleaned up');
    } else {
      console.log('❌ Test program not found after write');
    }

  } catch (error) {
    console.error('❌ Error writing test loyalty program:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error.code === 'permission-denied') {
      console.log('\n🔒 PERMISSION DENIED - This indicates a Firebase security rules issue');
      console.log('The loyaltyPrograms collection may not have proper write permissions');
    }
  } finally {
    process.exit(0);
  }
}

testLoyaltyProgramWrite();