import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Coupon } from '../types';
import { QRCodeService } from './qrCodeService';

// Simple random code generator
const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Define CouponType interface
interface CouponType {
  id: string;
  name?: string;
  label?: string; // Added to match the CouponType from CouponTypeSelector
  description?: string;
  icon?: string;
  color?: string;
  // Add any other properties that might be in the CouponType
}

// Debug result type definition
interface DebugResult {
  businessId: string;
  summary: {
    totalCoupons: number;
    totalDistributions: number;
    totalCustomerCoupons: number;
  };
  couponsCollection: any[];
  distributionsCollection: any[];
  customerCouponsCollection: any[];
  uniqueCouponIds: string[];
  error?: string;
}

/**
 * Get all coupons for a business
 * @param businessId Business ID
 * @param filter Optional filter criteria
 * @param limit Optional limit of results
 * @param activeOnly Only return active coupons
 * @returns Promise that resolves to an array of coupons
 */
export const getCoupons = async (
  businessId: string,
  filter: any = null,
  resultLimit: number = 0,
  activeOnly: boolean = false
): Promise<Coupon[]> => {
  try {
    let queryConstraints: any[] = [
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    ];

    if (activeOnly) {
      queryConstraints.push(where('active', '==', true));
    }

    if (filter) {
      // Add additional filter constraints if needed
    }

    if (resultLimit > 0) {
      queryConstraints.push(limit(resultLimit));
    }

    const q = query(collection(db, 'coupons'), ...queryConstraints);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Coupon[];
  } catch (error) {
    console.error('Error getting coupons:', error);
    throw error;
  }
};

/**
 * Get a coupon by ID
 * @param couponId Coupon ID
 * @returns Promise that resolves to the coupon
 */
export const getCouponById = async (couponId: string): Promise<Coupon | null> => {
  try {
    const couponDoc = await getDoc(doc(db, 'coupons', couponId));

    if (couponDoc.exists()) {
      return {
        id: couponDoc.id,
        ...couponDoc.data()
      } as Coupon;
    }

    return null;
  } catch (error) {
    console.error('Error getting coupon:', error);
    throw error;
  }
};

/**
 * Add a new coupon
 * @param couponData Coupon data to add
 * @returns Promise that resolves to the created coupon
 */
export const addCoupon = async (couponData: Partial<Coupon & { qrCodeUrl?: string }>) => {
  try {
    // Create a sanitized copy of the data that removes undefined values
    const sanitizedData: Record<string, any> = {};

    // Copy all defined values
    Object.keys(couponData).forEach(key => {
      if (couponData[key as keyof typeof couponData] !== undefined) {
        sanitizedData[key] = couponData[key as keyof typeof couponData];
      }
    });

    // Set default values
    sanitizedData.createdAt = Timestamp.now();
    sanitizedData.updatedAt = Timestamp.now();
    sanitizedData.usageCount = 0;
    sanitizedData.active = sanitizedData.active !== undefined ? sanitizedData.active : true;
    sanitizedData.qrCodeUrl = sanitizedData.qrCodeUrl || '';

    // Ensure buyQuantity and getQuantity are numbers for buyXgetY type
    if (sanitizedData.type === 'buyXgetY') {
      sanitizedData.buyQuantity = Number(sanitizedData.buyQuantity) || 1;
      sanitizedData.getQuantity = Number(sanitizedData.getQuantity) || 1;
    }

    // Generate QR code for the coupon if it has a code
    if (sanitizedData.code) {
      try {
        const qrCodeDataUrl = await QRCodeService.generateCouponQRCode(sanitizedData.code);
        sanitizedData.qrCodeUrl = qrCodeDataUrl;
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Continue without QR code if generation fails
      }
    }

    const couponRef = await addDoc(collection(db, 'coupons'), sanitizedData);

    return {
      id: couponRef.id,
      ...sanitizedData
    };
  } catch (error) {
    console.error('Error adding coupon:', error);
    throw error;
  }
};

/**
 * Create and distribute a coupon to customers
 * @param businessId Business ID
 * @param businessName Business name
 * @param couponType Coupon type
 * @param selectedCustomers Array of selected customers
 * @returns Promise that resolves to the created coupon
 */
export const createAndDistributeCoupon = async (
  businessId: string,
  businessName: string,
  couponType: CouponType | string,
  selectedCustomers: string[]
) => {
  try {
    // Extract the coupon type name if it's a CouponType object
    const typeName = typeof couponType === 'string'
      ? couponType
      : (couponType.name || couponType.label || 'Special'); // Use label as fallback if name is not available

    // Create basic coupon data based on the type
    const couponData: Partial<Coupon> = {
      businessId,
      title: `${typeName} Offer`,
      description: `Special ${typeName} offer from ${businessName}`,
      type: typeName.toLowerCase().includes('percent') ? 'percentage' :
        typeName.toLowerCase().includes('free') ? 'freeItem' :
          typeName.toLowerCase().includes('buy') ? 'buyXgetY' : 'fixed',
      value: typeName.toLowerCase().includes('percent') ? 10 : 5, // Default values
      active: true,
      code: await generateCouponCodeForBusiness(businessId)
    };

    // Add type-specific fields
    if (couponData.type === 'buyXgetY') {
      couponData.buyQuantity = 1;
      couponData.getQuantity = 1;
    } else if (couponData.type === 'freeItem') {
      couponData.freeItem = 'Free Item';
    }

    // First create the coupon
    const coupon = await addCoupon(couponData);

    // If there are customer IDs, distribute the coupon
    if (selectedCustomers && selectedCustomers.length > 0) {
      // Create distribution records for each customer
      const distributionPromises = selectedCustomers.map(async (customerId) => {
        // Create a distribution record for each customer
        return await addDoc(collection(db, 'couponDistributions'), {
          couponId: coupon.id,
      businessId,
          customerId,
          status: 'sent',
          sentAt: Timestamp.now(),
        });
      });
      
      // Wait for all distribution records to be created
      await Promise.all(distributionPromises);
      
      // Update the coupon with distribution count
      await updateDoc(doc(db, 'coupons', coupon.id), {
        distributionCount: selectedCustomers.length
      });
    }

    return coupon;
  } catch (error) {
    console.error('Error creating and distributing coupon:', error);
    throw error;
  }
    };

/**
 * Update an existing coupon
 * @param couponId Coupon ID
 * @param couponData Updated coupon data
 * @returns Promise that resolves when the coupon is updated
 */
export const updateCoupon = async (couponId: string, couponData: Partial<Coupon>): Promise<void> => {
  try {
    const updateData = {
      ...couponData,
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, 'coupons', couponId), updateData);
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

/**
 * Delete a coupon
 * @param couponId Coupon ID
 * @returns Promise that resolves when the coupon is deleted
 */
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'coupons', couponId));
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

/**
 * Generate a unique coupon code for a business
 * @param businessId Business ID
 * @returns Promise that resolves to a unique coupon code
 */
export const generateCouponCodeForBusiness = async (businessId: string): Promise<string> => {
  try {
    // Generate a random code
    let code = generateRandomCode();

    // Check if the code already exists for this business
    const q = query(
      collection(db, 'coupons'),
      where('businessId', '==', businessId),
      where('code', '==', code)
    );

    let querySnapshot = await getDocs(q);

    // If the code already exists, generate a new one
    while (!querySnapshot.empty) {
      code = generateRandomCode();
      querySnapshot = await getDocs(
        query(
          collection(db, 'coupons'),
          where('businessId', '==', businessId),
          where('code', '==', code)
        )
      );
    }

    return code;
  } catch (error) {
    console.error('Error generating coupon code:', error);
    throw error;
  }
};

/**
 * Get active coupons for a business
 * @param businessId Business ID
 * @returns Promise that resolves to an array of active coupons
 */
export const getActiveCoupons = async (businessId: string): Promise<Coupon[]> => {
  try {
    const q = query(
      collection(db, 'coupons'),
      where('businessId', '==', businessId),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Coupon[];
  } catch (error) {
    console.error('Error getting active coupons:', error);
    throw error;
  }
};

/**
 * Get recent coupons for a business
 * @param businessId Business ID
 * @param count Number of coupons to get
 * @returns Promise that resolves to an array of recent coupons
 */
export const getRecentCoupons = async (businessId: string, count: number = 5): Promise<Coupon[]> => {
  try {
    const q = query(
      collection(db, 'coupons'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Coupon[];
  } catch (error) {
    console.error('Error getting recent coupons:', error);
    throw error;
  }
};

/**
 * Get customers who received a specific coupon
 * @param couponId Coupon ID
 * @returns Promise that resolves to an array of customer IDs
 */
export const getCouponRecipients = async (couponId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'couponDistributions'),
      where('couponId', '==', couponId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().customerId);
  } catch (error) {
    console.error('Error getting coupon recipients:', error);
    throw error;
  }
};

/**
 * Debug function to analyze coupons for a business
 * @param businessId Business ID to debug
 * @returns Promise that resolves to debug results
 */
export const debugCoupons = async (businessId: string): Promise<DebugResult> => {
  try {
    // Get coupons from main collection
    const couponsQuery = query(
      collection(db, 'coupons'),
      where('businessId', '==', businessId)
    );
    const couponsSnapshot = await getDocs(couponsQuery);
    const coupons = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get distributions for this business
    const distributionsQuery = query(
      collection(db, 'couponDistributions'),
      where('businessId', '==', businessId)
    );
    const distributionsSnapshot = await getDocs(distributionsQuery);
    const distributions = distributionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Track unique coupon IDs
    const uniqueCouponIds = coupons.map(coupon => coupon.id);

    // Return debug results
    return {
      businessId,
      summary: {
        totalCoupons: coupons.length,
        totalDistributions: distributions.length,
        totalCustomerCoupons: distributions.length // Same as distributions in this model
      },
      couponsCollection: coupons,
      distributionsCollection: distributions,
      customerCouponsCollection: [], // Not used in this implementation
      uniqueCouponIds
    };
  } catch (error: any) {
    console.error('Error debugging coupons:', error);
    return {
      businessId,
      summary: {
        totalCoupons: 0,
        totalDistributions: 0,
        totalCustomerCoupons: 0
      },
      couponsCollection: [],
      distributionsCollection: [],
      customerCouponsCollection: [],
      uniqueCouponIds: [],
      error: error.message || 'Unknown error occurred during debug'
    };
  }
};