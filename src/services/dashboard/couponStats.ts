import { collection, query, where, getDocs, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ActivityItem } from './types';
import { toJsDate } from './utils';

// Get active coupons count
export const getActiveCouponsCount = async (businessId: string): Promise<number> => {
  try {
    const couponsRef = collection(db, 'coupons');
    const activeCouponsQuery = query(
      couponsRef, 
      where('businessId', '==', businessId),
      where('active', '==', true)
    );
    const activeCouponsSnapshot = await getCountFromServer(activeCouponsQuery);
    return activeCouponsSnapshot.data().count;
  } catch (error) {
    console.error('Error getting active coupons count:', error);
    return 0;
  }
};

// Get total redemptions count
export const getTotalRedemptionsCount = async (businessId: string): Promise<number> => {
  try {
    const customerCouponsRef = collection(db, 'customerCoupons');
    const redeemedCouponsQuery = query(
      customerCouponsRef, 
      where('businessId', '==', businessId),
      where('used', '==', true)
    );
    const redeemedCouponsSnapshot = await getCountFromServer(redeemedCouponsQuery);
    return redeemedCouponsSnapshot.data().count;
  } catch (error) {
    console.error('Error getting total redemptions count:', error);
    return 0;
  }
};

// Get redemptions within a specific time period
export const getRedemptionsInPeriod = async (
  businessId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const customerCouponsRef = collection(db, 'customerCoupons');
    const periodRedemptionsQuery = query(
      customerCouponsRef, 
      where('businessId', '==', businessId),
      where('used', '==', true),
      where('usedAt', '>=', startTimestamp),
      where('usedAt', '<=', endTimestamp)
    );
    const periodRedemptionsSnapshot = await getCountFromServer(periodRedemptionsQuery);
    return periodRedemptionsSnapshot.data().count;
  } catch (error) {
    console.error('Error getting redemptions in period:', error);
    return 0;
  }
};

// Get recent coupon creations
export const getRecentCouponCreations = async (
  businessId: string,
  startDate: Date
): Promise<ActivityItem[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const couponsRef = collection(db, 'coupons');
    const recentCouponsQuery = query(
      couponsRef,
      where('businessId', '==', businessId),
      where('createdAt', '>=', startTimestamp)
    );
    const recentCouponsSnapshot = await getDocs(recentCouponsQuery);
    
    const couponCreations: ActivityItem[] = [];
    recentCouponsSnapshot.forEach(doc => {
      const couponData = doc.data();
      couponCreations.push({
        id: `coupon-created-${doc.id}`,
        type: 'coupon_created',
        title: `New coupon created: ${couponData.title || 'Untitled'}`,
        timestamp: couponData.createdAt,
        entityId: doc.id
      });
    });
    
    return couponCreations;
  } catch (error) {
    console.error('Error getting recent coupon creations:', error);
    return [];
  }
};

// Get recent coupon redemptions
export const getRecentCouponRedemptions = async (
  businessId: string,
  startDate: Date
): Promise<ActivityItem[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const customerCouponsRef = collection(db, 'customerCoupons');
    const recentRedemptionsQuery = query(
      customerCouponsRef,
      where('businessId', '==', businessId),
      where('usedAt', '>=', startTimestamp)
    );
    const recentRedemptionsSnapshot = await getDocs(recentRedemptionsQuery);
    
    const redemptions: ActivityItem[] = [];
    recentRedemptionsSnapshot.forEach(doc => {
      const redemptionData = doc.data();
      redemptions.push({
        id: `coupon-redeemed-${doc.id}`,
        type: 'coupon_redeemed',
        title: `Coupon redeemed: ${redemptionData.title || redemptionData.couponId || 'Unknown'}`,
        timestamp: redemptionData.usedAt,
        entityId: doc.id
      });
    });
    
    return redemptions;
  } catch (error) {
    console.error('Error getting recent coupon redemptions:', error);
    return [];
  }
};