import { 
  getDoc,
  doc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Coupon } from '../types/coupon.enhanced';

interface BusinessInfo {
  name: string;
  logo: string | undefined;
  colors: {
    primary: string;
    secondary: string;
  };
}

/**
 * Fetches detailed information for a list of coupon IDs
 * @param couponIds Array of coupon IDs to fetch details for
 * @returns Array of formatted Coupon objects
 */
export const fetchCouponDetails = async (couponIds: string[]): Promise<Coupon[]> => {
  // Fetch the actual coupon details
  const couponPromises = couponIds.map(id => getDoc(doc(db, 'coupons', id)));
  const couponDocs = await Promise.all(couponPromises);
  const validCouponDocs = couponDocs.filter(doc => doc.exists());
  console.log('Valid coupon documents:', validCouponDocs.length);
  
  // Get business details for each coupon
  const businessIds = extractBusinessIds(validCouponDocs);
  console.log('Business IDs to fetch:', businessIds);
  
  const businessMap = await fetchBusinessInfo(businessIds);
  
  // Format all the coupons
  const customerCoupons: Coupon[] = [];
  
  for (const couponDoc of validCouponDocs) {
    const formattedCoupon = await formatCouponData(couponDoc, businessMap);
    if (formattedCoupon) {
      customerCoupons.push(formattedCoupon);
      console.log('Added formatted coupon:', formattedCoupon.title);
    }
  }
  
  return customerCoupons;
};

/**
 * Extracts unique business IDs from coupon documents
 * @param couponDocs Array of coupon document snapshots
 * @returns Array of unique business IDs
 */
const extractBusinessIds = (couponDocs: DocumentData[]): string[] => {
  return couponDocs
    .map(doc => {
      const data = doc.data();
      return data?.businessId as string | undefined;
    })
    .filter((id): id is string => !!id) // Filter out undefined/null/empty
    .filter((id, index, self) => self.indexOf(id) === index); // Get unique business IDs
};

/**
 * Fetches business information for a list of business IDs
 * @param businessIds Array of business IDs
 * @returns Map of business ID to business info
 */
const fetchBusinessInfo = async (businessIds: string[]): Promise<Record<string, BusinessInfo>> => {
  const businessPromises = businessIds.map(id => getDoc(doc(db, 'businesses', id)));
  const businessDocs = await Promise.all(businessPromises);
  
  // Create a map of business ID to business info
  const businessMap: Record<string, BusinessInfo> = {};
  businessDocs.forEach(doc => {
    if (doc.exists()) {
      const data = doc.data();
      businessMap[doc.id] = {
        name: data.businessName || 'Unknown Business',
        logo: data.logo || undefined,
        colors: {
          primary: data.colors?.primary || '#3B82F6',
          secondary: data.colors?.secondary || '#10B981'
        }
      };
    }
  });
  
  return businessMap;
};

/**
 * Formats coupon data into a standardized Coupon object
 * @param couponDoc Coupon document snapshot
 * @param businessMap Map of business ID to business info
 * @returns Formatted Coupon object or null if invalid
 */
const formatCouponData = async (
  couponDoc: DocumentData, 
  businessMap: Record<string, BusinessInfo>
): Promise<Coupon | null> => {
  const couponData = couponDoc.data();
  if (!couponData) return null; // Skip if no data
  
  const businessId = couponData.businessId as string || '';
  const business = businessMap[businessId] || { 
    name: 'Unknown Business', 
    logo: undefined,
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981'
    }
  };
  
  // Format the coupon data
  const formattedCoupon: Coupon = {
    id: couponDoc.id,
    businessId: businessId,
    distributionId: couponDoc.id, // Default to coupon ID if no distribution
    businessName: business.name,
    businessLogo: business.logo,
    businessColors: business.colors,
    title: couponData.title || 'Unknown Coupon',
    description: couponData.description || 'No description available',
    discount: getDiscountText(couponData),
    startDate: getDateFromTimestamp(couponData.startDate, new Date()),
    endDate: getDateFromTimestamp(couponData.endDate, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    active: couponData.active !== false, // Default to true if not specified
    code: couponData.code || 'UNKNOWN',
    terms: couponData.termsAndConditions || '',
    status: 'viewed', // Default status
    value: couponData.value || 0
  };

  return formattedCoupon;
};

/**
 * Helper function to get discount text from coupon data
 * @param couponData Coupon document data
 * @returns Formatted discount text
 */
export function getDiscountText(couponData: DocumentData): string {
  if (!couponData) return 'Unknown discount';
  
  if (couponData.type === 'percentage') {
    return `${couponData.value || 0}%`;
  } else if (couponData.type === 'fixed') {
    return `$${couponData.value || 0}`;
  } else if (couponData.type === 'buyXgetY') {
    return `Buy ${couponData.buyQuantity || 1} get ${couponData.getQuantity || 1}`;
  } else {
    return `Free ${couponData.freeItem || 'item'}`;
  }
}

/**
 * Helper function to convert Firestore timestamp to Date
 * @param timestamp Firestore timestamp or date-like value
 * @param defaultDate Default date to use if conversion fails
 * @returns JavaScript Date object
 */
export function getDateFromTimestamp(timestamp: any, defaultDate: Date): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (timestamp) {
    try {
      return new Date(timestamp);
    } catch (e) {
      return defaultDate;
    }
  }
  return defaultDate;
}