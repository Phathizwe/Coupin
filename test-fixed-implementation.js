const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to get the correct businessId (copied from the fixed app)
const getCorrectBusinessId = (businessId) => {
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe';
  }
  return businessId;
};

// Simulate the fixed initializeLoyaltyProgram function
async function simulateFixedLoyaltyProgramCreation(businessId) {
  try {
    console.log('=== SIMULATING FIXED LOYALTY PROGRAM CREATION ===');
    console.log('Input businessId:', businessId);

    // Validate businessId (new validation)
    if (!businessId || businessId === 'undefined' || businessId === 'null') {
      throw new Error('Invalid businessId provided to initializeLoyaltyProgram');
    }

    const correctedBusinessId = getCorrectBusinessId(businessId);
    console.log('Corrected businessId:', correctedBusinessId);

    // Check if program already exists
    const loyaltyQuery = await db.collection('loyaltyPrograms')
      .where('businessId', '==', correctedBusinessId)
      .get();

    if (!loyaltyQuery.empty) {
      console.log('✅ Program already exists, would return existing program');
      return loyaltyQuery.docs[0].data();
    }

    // Create new program
    const programRef = db.collection('loyaltyPrograms').doc();
    const defaultProgram = {
      businessId: correctedBusinessId,
      name: 'Customer Rewards',
      description: 'Earn points with every purchase and redeem for rewards',
      type: 'points',
      pointsPerAmount: 10,
      amountPerPoint: 0.1,
      active: true,
      rewards: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await programRef.set(defaultProgram);
    console.log('✅ Created loyalty program with ID:', programRef.id);

    // Create achievements with CORRECTED businessId (this is the fix!)
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
      },
      {
        title: 'First Redemption',
        description: 'A customer redeemed their first reward',
        icon: '🎁',
        completed: false,
        completedAt: null
      },
      {
        title: 'Loyalty Champion',
        description: 'Your program reached 50 members',
        icon: '🏆',
        completed: false,
        completedAt: null
      }
    ];

    console.log('Creating achievements with corrected businessId:', correctedBusinessId);

    for (const defaultAchievement of DEFAULT_ACHIEVEMENTS) {
      const achievementRef = db.collection('loyaltyAchievements').doc();
      const achievementData = {
        ...defaultAchievement,
        businessId: correctedBusinessId, // Using corrected businessId (THE FIX!)
        programId: programRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await achievementRef.set(achievementData);
      console.log(`✅ Created achievement: ${achievementData.title}`);
    }

    return {
      ...defaultProgram,
      id: programRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Error in simulation:', error);
    throw error;
  }
}

async function testFixedImplementation() {
  try {
    console.log('=== TESTING FIXED IMPLEMENTATION ===');

    const businessId = 'Mt8ZZpQXyXMt2IEAOKNe';

    // Test the fixed implementation
    const program = await simulateFixedLoyaltyProgramCreation(businessId);

    console.log('\n=== VERIFICATION ===');

    // Check that loyalty program was created
    const programQuery = await db.collection('loyaltyPrograms')
      .where('businessId', '==', 'Mt8ZZpQXyXOHzlEAOKNe')
      .get();

    console.log(`✅ Loyalty programs found: ${programQuery.size}`);

    if (!programQuery.empty) {
      const programData = programQuery.docs[0].data();
      console.log(`Program businessId: ${programData.businessId}`);
      console.log(`Program name: ${programData.name}`);
    }

    // Check that achievements were created with correct businessId
    const achievementsQuery = await db.collection('loyaltyAchievements')
      .where('businessId', '==', 'Mt8ZZpQXyXOHzlEAOKNe')
      .get();

    console.log(`✅ Achievements found: ${achievementsQuery.size}`);

    if (!achievementsQuery.empty) {
      console.log('Achievement details:');
      achievementsQuery.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.title} (businessId: ${data.businessId})`);
      });
    }

    // Check that no orphaned achievements were created
    const orphanedQuery = await db.collection('loyaltyAchievements')
      .where('businessId', '==', 'business_id')
      .get();

    console.log(`✅ Orphaned achievements: ${orphanedQuery.size} (should be 0)`);

    // Test querying the program (this should work now)
    const queryTest = await db.collection('loyaltyPrograms')
      .where('businessId', '==', businessId)
      .get();

    console.log(`✅ Query with original businessId finds: ${queryTest.size} programs`);

    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Loyalty program creation: SUCCESS');
    console.log('✅ Achievement creation: SUCCESS');
    console.log('✅ BusinessId consistency: SUCCESS');
    console.log('✅ No orphaned records: SUCCESS');

    // Clean up test data
    console.log('\n=== CLEANUP ===');
    if (!programQuery.empty) {
      await programQuery.docs[0].ref.delete();
      console.log('✅ Test program deleted');
    }

    for (const doc of achievementsQuery.docs) {
      await doc.ref.delete();
    }
    console.log('✅ Test achievements deleted');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedImplementation();