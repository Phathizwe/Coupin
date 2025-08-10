import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface OnboardingStatus {
  hasCreatedCoupons: boolean;
  hasCompletedProfile: boolean;
  hasSharedCoupons: boolean;
}

export const checkOnboardingStatus = async (businessId: string): Promise<OnboardingStatus> => {
  try {
    // Check if business has created any coupons
    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(
      couponsRef,
      where('businessId', '==', businessId)
    );
    const couponsSnapshot = await getDocs(couponsQuery);
    const hasCreatedCoupons = !couponsSnapshot.empty;

    // Check if business has completed their profile
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    const businessData = businessDoc.exists() ? businessDoc.data() : null;
    
    // Consider profile complete if they have set an industry, logo, and description
    const hasCompletedProfile = businessData && 
      businessData.industry && 
      businessData.industry !== 'Not specified' &&
      (businessData.logo || businessData.description);

    // Check if business has shared any coupons with customers
    const distributionsRef = collection(db, 'couponDistributions');
    const distributionsQuery = query(
      distributionsRef,
      where('businessId', '==', businessId)
    );
    const distributionsSnapshot = await getDocs(distributionsQuery);
    const hasSharedCoupons = !distributionsSnapshot.empty;

    return {
      hasCreatedCoupons,
      hasCompletedProfile: !!hasCompletedProfile,
      hasSharedCoupons
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      hasCreatedCoupons: false,
      hasCompletedProfile: false,
      hasSharedCoupons: false
    };
  }
};