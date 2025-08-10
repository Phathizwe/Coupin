const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testLoyaltyProgramCreation() {
  try {
    console.log('=== TESTING LOYALTY PROGRAM CREATION ===');

    // The businessId from the screenshots
    const originalBusinessId = 'Mt8ZZpQXyXMt2IEAOKNe';
    const correctedBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe';

    console.log(`Testing with businessId: ${originalBusinessId}`);
    console.log(`Corrected businessId: ${correctedBusinessId}`);

    // Step 1: Try to create a loyalty program (simulating the initializeLoyaltyProgram function)
    console.log('\n=== STEP 1: Creating Loyalty Program ===');

    const programRef = db.collection('loyaltyPrograms').doc();
    const defaultProgram = {
      businessId: correctedBusinessId,
      name: 'Test Customer Rewards',
      description: 'Test loyalty program creation',
      type: 'points',
      pointsPerAmount: 10,
      amountPerPoint: 0.1,
      active: true,
      rewards: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Attempting to create loyalty program with data:', {
      businessId: defaultProgram.businessId,
      name: defaultProgram.name,
      programId: programRef.id
    });

    await programRef.set(defaultProgram);
    console.log(`✅ Successfully created loyalty program with ID: ${programRef.id}`);

    // Step 2: Try to create achievements (simulating the getLoyaltyAchievements function)
    console.log('\n=== STEP 2: Creating Achievements ===');

    const DEFAULT_ACHIEVEMENTS = [
      {
        title: 'Program Launch',
        description: 'Successfully launched your loyalty program',
        icon: '🚀',
        completed: true,
        completedAt: new Date()
      },
      {
        title: 'First 10 Members',
        description: 'Your program reached 10 members',
        icon: '👥',
        completed: false,
        completedAt: null
      }
    ];

    // Test with original businessId (this is what's happening in the bug)
    console.log(`Creating achievements with ORIGINAL businessId: ${originalBusinessId}`);

    for (const defaultAchievement of DEFAULT_ACHIEVEMENTS) {
      const achievementRef = db.collection('loyaltyAchievements').doc();
      const achievementData = {
        ...defaultAchievement,
        businessId: originalBusinessId, // Using original businessId
        programId: programRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      console.log('Creating achievement:', {
        title: achievementData.title,
        businessId: achievementData.businessId,
        programId: achievementData.programId
      });

      await achievementRef.set(achievementData);
      console.log(`✅ Created achievement: ${achievementData.title}`);
    }

    // Step 3: Verify what was created
    console.log('\n=== STEP 3: Verifying Creation ===');

    // Check loyalty program
    const programDoc = await programRef.get();
    if (programDoc.exists) {
      const programData = programDoc.data();
      console.log(`✅ Loyalty program exists with businessId: ${programData.businessId}`);
    }

    // Check achievements
    const achievementsQuery = await db.collection('loyaltyAchievements')
      .where('programId', '==', programRef.id)
      .get();

    console.log(`Found ${achievementsQuery.size} achievements for this program`);
    achievementsQuery.forEach(doc => {
      const data = doc.data();
      console.log(`- Achievement: ${data.title}, businessId: ${data.businessId}`);
    });

    // Step 4: Try to query the program using the original businessId (this should fail)
    console.log('\n=== STEP 4: Testing Query Mismatch ===');

    const queryWithOriginal = await db.collection('loyaltyPrograms')
      .where('businessId', '==', originalBusinessId)
      .get();
    console.log(`Programs found with original businessId: ${queryWithOriginal.size}`);

    const queryWithCorrected = await db.collection('loyaltyPrograms')
      .where('businessId', '==', correctedBusinessId)
      .get();
    console.log(`Programs found with corrected businessId: ${queryWithCorrected.size}`);

    // Clean up
    console.log('\n=== CLEANUP ===');
    await programRef.delete();
    for (const doc of achievementsQuery.docs) {
      await doc.ref.delete();
    }
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testLoyaltyProgramCreation();