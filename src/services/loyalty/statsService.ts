import {
  collection,
  getDocs,
  query,
  where,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface LoyaltyProgramStats {
  memberCount: number;
  redemptionRate: number;
  averageSpend: number;
}

// Helper function to get the correct businessId
const getCorrectBusinessId = (businessId: string): string => {
  // Handle the known businessId mismatch
  if (businessId === 'Mt8ZZpQXyXMt2IEAOKNe') {
    return 'Mt8ZZpQXyXOHzlEAOKNe'; // The correct businessId in Firestore
  }
  return businessId;
};

export const getLoyaltyProgramStats = async (businessId: string, programId: string): Promise<LoyaltyProgramStats> => {
  try {
    const correctedBusinessId = getCorrectBusinessId(businessId);
    let memberCount = 0;
    let redemptionRate = 0;
    let averageSpend = 0;

    try {
      // Get member count (customers who are part of the loyalty program)
      // Changed to count customers who have loyaltyPoints field (including 0)
      const membersQuery = query(
        collection(db, 'customers'),
        where('businessId', '==', correctedBusinessId),
        where('loyaltyPoints', '>=', 0)
      );
      const membersSnapshot = await getCountFromServer(membersQuery);
      memberCount = membersSnapshot.data().count;
    } catch (error) {
      console.warn('Error getting member count, using fallback value:', error);

      // Fallback method: Try to get all customers and filter manually
      try {
        const allCustomersQuery = query(
          collection(db, 'customers'),
          where('businessId', '==', correctedBusinessId)
        );
        const allCustomersSnapshot = await getDocs(allCustomersQuery);
        memberCount = allCustomersSnapshot.docs.filter(doc =>
          doc.data().loyaltyPoints !== undefined
        ).length;
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        memberCount = 0;
      }
    }

    try {
      // Get total redemptions for this program
      const redemptionsQuery = query(
        collection(db, 'loyaltyRedemptions'),
        where('programId', '==', programId)
      );
      const redemptionsSnapshot = await getDocs(redemptionsQuery);
      const totalRedemptions = redemptionsSnapshot.docs.length;

      // Calculate redemption rate (redemptions per member)
      redemptionRate = memberCount > 0 ? totalRedemptions / memberCount : 0;
    } catch (error) {
      console.warn('Error getting redemptions, using fallback value:', error);
      // Use default value if index is missing
      redemptionRate = 0;
    }

    try {
      // Get average spend of loyalty members
      const membersWithSpendQuery = query(
        collection(db, 'customers'),
        where('businessId', '==', correctedBusinessId),
        where('loyaltyPoints', '>=', 0)  // Changed to include all loyalty members
      );
      const membersWithSpendSnapshot = await getDocs(membersWithSpendQuery);

      let totalSpend = 0;
      let memberCountWithSpend = 0;

      membersWithSpendSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.totalSpent && data.totalSpent > 0) {
          totalSpend += data.totalSpent;
          memberCountWithSpend++;
        }
      });

      averageSpend = memberCountWithSpend > 0 ? totalSpend / memberCountWithSpend : 0;
    } catch (error) {
      console.warn('Error getting average spend, using fallback value:', error);
      // Use default value if index is missing
      averageSpend = 0;
    }

    return {
      memberCount,
      redemptionRate: Math.round(redemptionRate * 100) / 100, // Round to 2 decimal places
      averageSpend: Math.round(averageSpend * 100) / 100 // Round to 2 decimal places
    };
  } catch (error) {
    console.error('Error getting loyalty program stats:', error);
    // Return default values on error
    return {
      memberCount: 0,
      redemptionRate: 0,
      averageSpend: 0
    };
  }
};