const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugLoyaltyCreation() {
  try {
    console.log('=== DEBUGGING LOYALTY PROGRAM CREATION PROCESS ===');

    // The businessId from the screenshots
    const originalBusinessId = 'Mt8ZZpQXyXMt2IEAOKNe';
    const correctedBusinessId = 'Mt8ZZpQXyXOHzlEAOKNe';

    console.log(`Original businessId: ${originalBusinessId}`);
    console.log(`Corrected businessId: ${correctedBusinessId}`);

    // Check both business IDs in loyaltyPrograms collection
    console.log('\n=== CHECKING LOYALTY PROGRAMS COLLECTION ===');

    const loyaltyProgramsRef = db.collection('loyaltyPrograms');
    const allPrograms = await loyaltyProgramsRef.get();
    console.log(`Total loyalty programs: ${allPrograms.size}`);

    // Check for original businessId
    const originalQuery = await loyaltyProgramsRef
      .where('businessId', '==', originalBusinessId)
      .get();
    console.log(`Programs with original businessId (${originalBusinessId}): ${originalQuery.size}`);

    // Check for corrected businessId
    const correctedQuery = await loyaltyProgramsRef
      .where('businessId', '==', correctedBusinessId)
      .get();
    console.log(`Programs with corrected businessId (${correctedBusinessId}): ${correctedQuery.size}`);

    // Check loyaltyAchievements collection (which seems to be getting created)
    console.log('\n=== CHECKING LOYALTY ACHIEVEMENTS COLLECTION ===');

    const achievementsRef = db.collection('loyaltyAchievements');
    const allAchievements = await achievementsRef.get();
    console.log(`Total loyalty achievements: ${allAchievements.size}`);

    if (!allAchievements.empty) {
      console.log('\n=== ACHIEVEMENT DETAILS ===');
      allAchievements.forEach(doc => {
        const data = doc.data();
        console.log(`Achievement ID: ${doc.id}`);
        console.log(`Business ID: ${data.businessId}`);
        console.log(`Program ID: ${data.programId}`);
        console.log(`Title: ${data.title}`);
        console.log(`Created At: ${data.createdAt ? data.createdAt.toDate() : 'No date'}`);
        console.log('---');
      });
    }

    // Check for achievements with both business IDs
    const originalAchievements = await achievementsRef
      .where('businessId', '==', originalBusinessId)
      .get();
    console.log(`Achievements with original businessId: ${originalAchievements.size}`);

    const correctedAchievements = await achievementsRef
      .where('businessId', '==', correctedBusinessId)
      .get();
    console.log(`Achievements with corrected businessId: ${correctedAchievements.size}`);

    // Check if there are any loyaltyPoints documents
    console.log('\n=== CHECKING LOYALTY POINTS COLLECTION ===');

    const loyaltyPointsRef = db.collection('loyaltyPoints');
    const allPoints = await loyaltyPointsRef.get();
    console.log(`Total loyalty points documents: ${allPoints.size}`);

    // Check businesses collection to verify the business exists
    console.log('\n=== CHECKING BUSINESS DOCUMENT ===');

    const businessRef = db.collection('businesses').doc(originalBusinessId);
    const businessDoc = await businessRef.get();
    console.log(`Business document exists (${originalBusinessId}): ${businessDoc.exists}`);

    if (businessDoc.exists) {
      const businessData = businessDoc.data();
      console.log(`Business name: ${businessData.businessName || 'No name'}`);
    }

    const correctedBusinessRef = db.collection('businesses').doc(correctedBusinessId);
    const correctedBusinessDoc = await correctedBusinessRef.get();
    console.log(`Business document exists (${correctedBusinessId}): ${correctedBusinessDoc.exists}`);

    if (correctedBusinessDoc.exists) {
      const businessData = correctedBusinessDoc.data();
      console.log(`Business name: ${businessData.businessName || 'No name'}`);
    }

    // Now let's try to manually create a loyalty program to see if there are any permission issues
    console.log('\n=== ATTEMPTING TO CREATE TEST LOYALTY PROGRAM ===');

    try {
      const testProgramRef = db.collection('loyaltyPrograms').doc();
      const testProgram = {
        businessId: correctedBusinessId,
        name: 'Test Customer Rewards',
        description: 'Test loyalty program',
        type: 'points',
        pointsPerAmount: 10,
        amountPerPoint: 0.1,
        active: true,
        rewards: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await testProgramRef.set(testProgram);
      console.log(`✅ Successfully created test loyalty program with ID: ${testProgramRef.id}`);

      // Clean up the test program
      await testProgramRef.delete();
      console.log('✅ Test program cleaned up');

    } catch (createError) {
      console.error('❌ Failed to create test loyalty program:', createError);
    }

  } catch (error) {
    console.error('Error during debug:', error);
  }
}

debugLoyaltyCreation();