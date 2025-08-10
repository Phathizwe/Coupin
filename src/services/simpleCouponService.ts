import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export const fetchCustomers = async (businessId: string) => {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(
      customersRef, 
      where('businessId', '==', businessId),
      orderBy('lastVisit', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const addCustomer = async (
  businessId: string, 
  customerData: { firstName: string; lastName: string; phone: string }
) => {
  try {
    const newCustomerData = {
      businessId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      joinDate: Timestamp.now(),
      lastVisit: Timestamp.now(),
      totalVisits: 1,
      totalSpent: 0
    };
    
    const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
    return { id: docRef.id, ...newCustomerData };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const createAndDistributeCoupon = async (
  businessId: string,
  businessName: string,
  couponType: { id: string; label: string; value: any },
  selectedCustomerIds: string[]
) => {
  try {
    // Generate a unique coupon code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create a base coupon object with required fields
    const baseCouponData = {
      businessId,
      title: couponType.label,
      description: `Limited time offer from ${businessName}`,
      type: couponType.value.type || 'percentage',
      value: couponType.value.value || 10,
      startDate: Timestamp.now(),
      endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      usageLimit: 1,
      usageCount: 0,
      distributionCount: selectedCustomerIds.length,
      customerLimit: 1,
      firstTimeOnly: false,
      birthdayOnly: false,
      active: true,
      code: code,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Set status to match what the main app expects for filtering
      status: 'active'
    };
    
    // Add type-specific fields based on coupon type
    let couponData: any = { ...baseCouponData };
    
    if (couponType.id === 'percent') {
      // 10% OFF NEXT VISIT
      couponData.type = 'percentage';
      couponData.value = 10;
    } 
    else if (couponType.id === 'appetizer') {
      // FREE APPETIZER
      couponData.type = 'freeItem';
      couponData.freeItem = 'Appetizer';
    }
    else if (couponType.id === 'bogo') {
      // BUY 1 GET 1
      couponData.type = 'buyXgetY';
      couponData.buyQuantity = 1;
      couponData.getQuantity = 1;
    }
    
    // Add the coupon to the database
    const couponRef = await addDoc(collection(db, 'coupons'), couponData);
    
    // Distribute to selected customers
    const distributions = selectedCustomerIds.map(customerId => ({
      businessId,
      couponId: couponRef.id,
      customerId,
      sentAt: Timestamp.now(),
      status: 'sent',
      redeemedAt: null
    }));
    
    // Batch add distributions
    for (const dist of distributions) {
      await addDoc(collection(db, 'couponDistributions'), dist);
  }
    
    // Return the coupon ID and code for confirmation
    return {
      couponId: couponRef.id,
      code: code
};
  } catch (error) {
    console.error('Error sending coupons:', error);
    throw error;
  }
};

// Add a function to get recent coupon activities
export const getRecentCouponActivities = async (
  businessId: string,
  maxResults: number = 20
) => {
  try {
    const distRef = collection(db, 'couponDistributions');
    const q = query(
      distRef,
      where('businessId', '==', businessId),
      orderBy('sentAt', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    
    // Get customer and coupon details for each activity
    const activitiesPromises = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Get customer info
      const customerDoc = await getDocs(query(
        collection(db, 'customers'),
        where('__name__', '==', data.customerId)
      ));
      
      // Get coupon info
      const couponDoc = await getDocs(query(
        collection(db, 'coupons'),
        where('__name__', '==', data.couponId)
      ));
      
      const customerData = customerDoc.docs[0]?.data();
      const couponData = couponDoc.docs[0]?.data();
      
      return {
        id: doc.id,
        customerName: customerData ? `${customerData.firstName} ${customerData.lastName}` : 'Unknown Customer',
        couponTitle: couponData?.title || 'Unknown Coupon',
        date: data.redeemedAt?.toDate() || data.sentAt?.toDate() || new Date(),
        status: data.status || 'sent'
      };
    });
    
    return Promise.all(activitiesPromises);
  } catch (error) {
    console.error('Error fetching coupon activities:', error);
    throw error;
  }
};