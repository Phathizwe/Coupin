const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to get the correct businessId (copied from the app)
const getCorrectBusinessId = (businessId) => {
  // Handle the known businessId mismatch
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
  }
  return businessId;
};

async function testWithInvalidBusinessId() {
  try {
    console.log('=== TESTING WITH INVALID/UNDEFINED BUSINESS IDs ===');

    // Test scenarios that might cause the "business_id" placeholder
    const testCases = [
      { name: 'undefined', value: undefined },
      { name: 'null', value: null },
      { name: 'empty string', value: '' },
      { name: 'business_id', value: 'business_id' }
    ];

    for (const testCase of testCases) {
      console.log(`\n=== Testing with ${testCase.name}: ${testCase.value} ===`);

      try {
        const correctedBusinessId = getCorrectBusinessId(testCase.value);
        console.log(`Original: ${testCase.value}`);
        console.log(`Corrected: ${correctedBusinessId}`);

        // Try to create an achievement with this businessId
        const achievementRef = db.collection('loyaltyAchievements').doc();
        const achievementData = {
          title: 'Test Achievement',
          description: 'Test with invalid businessId',
          icon: '🧪',
          completed: false,
          businessId: correctedBusinessId || 'business_id', // This might be the fallback!
          programId: 'test_program_id',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        console.log(`Would create achievement with businessId: ${achievementData.businessId}`);

        // Don't actually create it, just log what would happen
        // await achievementRef.set(achievementData);

      } catch (error) {
        console.error(`Error with ${testCase.name}:`, error.message);
      }
    }

    // Now let's check what happens in the actual app flow
    console.log('\n=== SIMULATING ACTUAL APP FLOW ===');

    // Simulate what happens when user.businessId is undefined
    const user = {
      uid: 'test-user-id',
      businessId: undefined // This might be the issue!
    };

    console.log('User object:', user);
    console.log('user.businessId:', user.businessId);

    if (!user.businessId) {
      console.log('❌ user.businessId is falsy - this would cause issues!');

      // This is probably what's happening in the app
      const correctedBusinessId = getCorrectBusinessId(user.businessId);
      console.log('Corrected businessId when user.businessId is undefined:', correctedBusinessId);

      // If correctedBusinessId is also undefined, the app might use a fallback
      const finalBusinessId = correctedBusinessId || 'business_id';
      console.log('Final businessId with fallback:', finalBusinessId);
    }

    // Let's also check what the existing achievements in the database look like
    console.log('\n=== CHECKING EXISTING ACHIEVEMENTS ===');

    const achievementsQuery = await db.collection('loyaltyAchievements')
      .where('businessId', '==', 'business_id')
      .limit(5)
      .get();

    console.log(`Found ${achievementsQuery.size} achievements with businessId: "business_id"`);

    if (!achievementsQuery.empty) {
      const firstAchievement = achievementsQuery.docs[0].data();
      console.log('Sample achievement data:', {
        title: firstAchievement.title,
        businessId: firstAchievement.businessId,
        programId: firstAchievement.programId,
        createdAt: firstAchievement.createdAt ? firstAchievement.createdAt.toDate() : 'No date'
      });
    }

  } catch (error) {
    console.error('Error during test:', error);
  }
}

testWithInvalidBusinessId();