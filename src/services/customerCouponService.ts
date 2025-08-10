import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  or,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Coupon } from '../types';

// Interface for customer coupon allocation
export interface CustomerCoupon {
  id: string;
  customerId: string;
  couponId: string;
  businessId: string;
  code: string;
  allocated: boolean;
  used: boolean;
  usedDate?: Timestamp;
  expiryDate: Timestamp;
  allocatedDate: Timestamp;
}

// Get all coupons for a specific customer
export const getCustomerCoupons = async (customerId: string) => {
  try {
    // Query for coupons where either customerId or userId matches
    const customerCouponsQuery = query(
      collection(db, 'customerCoupons'),
      or(
        where('customerId', '==', customerId),
      where('userId', '==', customerId)
      )
    );
    
    const snapshot = await getDocs(customerCouponsQuery);
    const customerCoupons: CustomerCoupon[] = [];
    
    snapshot.forEach(doc => {
      customerCoupons.push({
        id: doc.id,
        ...doc.data()
      } as CustomerCoupon);
    });
    
    return customerCoupons;
  } catch (error) {
    console.error('Error getting customer coupons:', error);
    throw error;
  }
};

// Get coupon details for multiple coupon IDs
export const getCouponDetails = async (couponIds: string[]) => {
  try {
    const coupons: Coupon[] = [];
    
    // Fetch each coupon document
    for (const couponId of couponIds) {
      const couponDoc = await getDoc(doc(db, 'coupons', couponId));
      if (couponDoc.exists()) {
        coupons.push({
          id: couponDoc.id,
          ...couponDoc.data()
        } as Coupon);
      }
    }
    
    return coupons;
  } catch (error) {
    console.error('Error getting coupon details:', error);
    throw error;
  }
};

// Allocate a coupon to a customer
export const allocateCouponToCustomer = async (
  customerId: string,
  couponId: string,
  businessId: string,
  couponCode: string,
  expiryDate: Date
) => {
  try {
    // First, check if the coupon exists in the main coupons collection
    const couponRef = doc(db, 'coupons', couponId);
    const couponDoc = await getDoc(couponRef);
    
    // If the coupon doesn't exist in the main collection, create it
    if (!couponDoc.exists()) {
      console.log(`Creating coupon ${couponId} in main coupons collection`);
      
      // Get coupon details from the first allocation if possible
      const couponData = {
        businessId,
        title: `Coupon ${couponCode}`,
        description: `Coupon allocated to customers`,
        type: 'percentage', // Default type
        value: 10, // Default value
        code: couponCode,
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(expiryDate),
        usageLimit: 1,
        usageCount: 0,
        distributionCount: 1, // Start with 1 distribution
        customerLimit: 1,
        firstTimeOnly: false,
        birthdayOnly: false,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
      
      // Create the coupon in the main collection
      await setDoc(couponRef, couponData);
    } else {
      // If the coupon exists, update its distribution count
      await updateDoc(couponRef, {
        distributionCount: increment(1),
        updatedAt: Timestamp.now()
      });
  }
    
    // Now create the customer coupon allocation
    const customerCouponData = {
      customerId,
      couponId,
      businessId,
      code: couponCode,
      allocated: true,
      used: false,
      allocatedDate: serverTimestamp(),
      expiryDate: Timestamp.fromDate(expiryDate)
    };
    
    const docRef = await addDoc(collection(db, 'customerCoupons'), customerCouponData);
    
    return {
      id: docRef.id,
      ...customerCouponData
    };
  } catch (error) {
    console.error('Error allocating coupon to customer:', error);
    throw error;
  }
};

// Mark a customer's coupon as used
export const markCouponAsUsed = async (customerCouponId: string) => {
  try {
    const customerCouponRef = doc(db, 'customerCoupons', customerCouponId);
    
    await updateDoc(customerCouponRef, {
      used: true,
      usedDate: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking coupon as used:', error);
    throw error;
  }
};

// Get customer coupon usage statistics
export const getCustomerCouponStats = async (customerId: string) => {
  try {
    const customerCouponsQuery = query(
      collection(db, 'customerCoupons'),
      where('customerId', '==', customerId)
    );
    
    const snapshot = await getDocs(customerCouponsQuery);
    
    let totalAllocated = 0;
    let totalUsed = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalAllocated++;
      if (data.used) {
        totalUsed++;
      }
    });
    
    return {
      totalAllocated,
      totalUsed,
      unusedCoupons: totalAllocated - totalUsed
    };
  } catch (error) {
    console.error('Error getting customer coupon stats:', error);
    throw error;
  }
};

// Get all customers who have been allocated a specific coupon
export const getCustomersWithCoupon = async (couponId: string) => {
  try {
    const customerCouponsQuery = query(
      collection(db, 'customerCoupons'),
      where('couponId', '==', couponId)
    );
    
    const snapshot = await getDocs(customerCouponsQuery);
    const customerIds: string[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      customerIds.push(data.customerId);
    });
    
    return customerIds;
  } catch (error) {
    console.error('Error getting customers with coupon:', error);
    throw error;
  }
};