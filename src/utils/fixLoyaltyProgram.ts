import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createMissingLoyaltyProgram = async (programId: string, businessId: string) => {
  try {
    // Check if the program already exists
    const programRef = doc(db, 'loyaltyPrograms', programId);
    const programDoc = await getDoc(programRef);
    if (programDoc.exists()) {
      console.log(`Program ${programId} already exists.`);
      return { success: true, message: 'Program already exists' };
    }
    
    // Create the program document
    const programData = {
      id: programId,
      businessId: businessId,
      name: "Customer Rewards",
      description: "Earn points with every purchase and redeem for rewards",
      type: "points",
      pointsPerAmount: 10,
      amountPerPoint: 0.1,
      active: true,
      rewards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(programRef, programData);
    console.log(`Successfully created program ${programId} for business ${businessId}`);
    return { success: true, message: 'Program created successfully' };
  } catch (error) {
    console.error('Error creating missing loyalty program:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const findOrphanedAchievements = async () => {
  try {
    // Get all achievements
    const achievementsQuery = query(collection(db, 'loyaltyAchievements'));
    const achievementsSnapshot = await getDocs(achievementsQuery);
    if (achievementsSnapshot.empty) {
      return { success: true, message: 'No achievements found', orphans: [] };
    }
    
    // Group achievements by programId
    const programIds = new Set<string>();
    const achievementsByProgram: Record<string, any[]> = {};
    achievementsSnapshot.forEach(doc => {
      const data = doc.data();
      const programId = data.programId;
      if (programId) {
        programIds.add(programId);
        if (!achievementsByProgram[programId]) {
          achievementsByProgram[programId] = [];
        }
        achievementsByProgram[programId].push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Check which programs exist
    const orphanedPrograms: { programId: string, businessId: string, achievements: any[] }[] = [];
    
    // Fix for the Set iteration issue - convert to array first
    const programIdArray = Array.from(programIds);
    
    for (const programId of programIdArray) {
      const programRef = doc(db, 'loyaltyPrograms', programId);
      const programDoc = await getDoc(programRef);
      if (!programDoc.exists()) {
        // This is an orphaned program - get the businessId from the first achievement
        const achievements = achievementsByProgram[programId];
        const businessId = achievements[0]?.businessId;
        orphanedPrograms.push({
          programId,
          businessId,
          achievements
        });
      }
    }
    
    return { 
      success: true, 
      message: `Found ${orphanedPrograms.length} orphaned programs`,
      orphans: orphanedPrograms
    };
  } catch (error) {
    console.error('Error finding orphaned achievements:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      orphans: []
    };
  }
};

export const fixAllOrphanedPrograms = async () => {
  try {
    const { success, orphans } = await findOrphanedAchievements();
    if (!success || !orphans || orphans.length === 0) {
      return { success: false, message: 'No orphaned programs found or error occurred' };
    }

    const results = [];
    for (const orphan of orphans) {
      if (orphan.programId && orphan.businessId) {
        const result = await createMissingLoyaltyProgram(orphan.programId, orphan.businessId);
        results.push({
          programId: orphan.programId,
          businessId: orphan.businessId,
          result
        });
      }
    }
    
    return { 
      success: true, 
      message: `Fixed ${results.length} orphaned programs`,
      results
    };
  } catch (error) {
    console.error('Error fixing orphaned programs:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};