import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Coupon } from '../types/coupon';

// Fetch coupon distributions for a customer
export const fetchCouponDistributions = async (customerId: string) => {
  try {
    const distributionsRef = collection(db, 'couponDistributions');
    const q = query(distributionsRef, where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching coupon distributions:', error);
    throw error;
  }
};

// Check if a coupon distribution exists
export const checkCouponDistribution = async (couponId: string, customerId: string) => {
  try {
    const distributionsRef = collection(db, 'couponDistributions');
    const q = query(
      distributionsRef, 
      where('couponId', '==', couponId),
      where('customerId', '==', customerId)
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking coupon distribution:', error);
    return false;
  }
};

// Process newly assigned coupons
export const processCouponAssignment = async () => {
  try {
    // This function would typically be called by a background process or webhook
    // For now, we'll just check for new distributions when the customer views their coupons
    console.log('Processing coupon assignments...');
    return true;
  } catch (error) {
    console.error('Error processing coupon assignments:', error);
    return false;
  }
};

// Safe date conversion helper
const safeDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle string timestamps
  if (typeof dateValue === 'string') {
    try {
      return new Date(dateValue);
    } catch (e) {
      console.error('Invalid date string:', dateValue);
      return new Date();
    }
  }
  
  // Handle numeric timestamps (seconds)
  if (typeof dateValue === 'number') {
    try {
      return new Date(dateValue * 1000); // Convert seconds to milliseconds
    } catch (e) {
      console.error('Invalid timestamp number:', dateValue);
      return new Date();
    }
  }
  
  console.error('Unknown date format:', dateValue);
  return new Date();
};

// Format coupon data with proper date handling
export const formatCouponData = (couponData: any): Coupon => {
  return {
    id: couponData.id || '',
    businessId: couponData.businessId || '',
    businessName: couponData.businessName || 'Unknown Business',
    title: couponData.title || '',
    description: couponData.description || '',
    discount: couponData.discount || `${couponData.value || 0}% OFF`,
    startDate: safeDate(couponData.startDate),
    endDate: safeDate(couponData.endDate),
    active: couponData.active !== false,
    code: couponData.code || '',
    terms: couponData.terms || '',
    category: couponData.category || '',
    value: couponData.value
  };
};

// Manual refresh of coupon assignments
export const refreshCouponAssignments = async (customerId: string) => {
  try {
    console.log(`Manually refreshing coupon assignments for customer ${customerId}`);
    
    // Fetch all distributions for this customer
    const distributions = await fetchCouponDistributions(customerId);
    console.log(`Found ${distributions.length} distributions`);
    
    // Fetch coupon details for each distribution
    const couponPromises = distributions.map(async (distribution: any) => {
      try {
        const couponRef = doc(db, 'coupons', distribution.couponId);
        const couponSnap = await getDoc(couponRef);
        
        if (!couponSnap.exists()) {
          console.log(`Coupon not found: ${distribution.couponId}`);
          return null;
        }
        
        const couponData = couponSnap.data();
        const businessRef = doc(db, 'businesses', distribution.businessId);
        const businessSnap = await getDoc(businessRef);
        const businessData = businessSnap.exists() ? businessSnap.data() : {};
        
        return formatCouponData({
          id: distribution.couponId,
          distributionId: distribution.id,
          businessId: distribution.businessId,
          businessName: businessData.businessName,
          ...couponData,
          status: distribution.status || 'sent'
        });
      } catch (error) {
        console.error(`Error fetching coupon ${distribution.couponId}:`, error);
        return null;
      }
    });
    
    const coupons = await Promise.all(couponPromises);
    return coupons.filter(coupon => coupon !== null);
  } catch (error) {
    console.error('Error refreshing coupon assignments:', error);
    throw error;
  }
};