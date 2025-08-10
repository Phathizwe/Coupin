import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { Coupon, Customer } from '../../types';
import { useNavigate } from 'react-router-dom';

export const useCouponProcessing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract coupon code from various formats
  const extractCouponCode = (rawData: string): string => {
    console.log("Extracting coupon code from:", rawData);
    
    // Try to parse as JSON
    try {
      if (rawData.includes('{') && rawData.includes('}')) {
        const jsonStart = rawData.indexOf('{');
        const jsonEnd = rawData.lastIndexOf('}') + 1;
        const jsonStr = rawData.substring(jsonStart, jsonEnd);
        
        const parsed = JSON.parse(jsonStr);
        
        // Check for coupon code in common formats
        if (parsed.type === 'coupon' && parsed.code) {
          console.log("Found coupon code in JSON:", parsed.code);
          return parsed.code;
        }
        
        if (parsed.code) {
          console.log("Found code property in JSON:", parsed.code);
          return parsed.code;
        }
        
        if (parsed.couponCode) {
          console.log("Found couponCode property in JSON:", parsed.couponCode);
          return parsed.couponCode;
        }
      }
    } catch (err) {
      console.log("JSON parsing failed, continuing with other methods");
    }
    
    // Check for common patterns like "CODE:ABCDEF"
    const codePattern = /code[:=]\s*([a-z0-9]+)/i;
    const codeMatch = rawData.match(codePattern);
    if (codeMatch && codeMatch[1]) {
      console.log("Found code pattern in string:", codeMatch[1]);
      return codeMatch[1];
    }
    
    // If all else fails, use the raw data (trimmed)
    // but limit to alphanumeric characters to avoid scanning errors
    const cleanCode = rawData.replace(/[^a-z0-9]/gi, '');
    console.log("Using cleaned raw data as code:", cleanCode);
    return cleanCode;
  };

  const handleCodeScanned = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user?.businessId) {
        throw new Error('Business ID not found');
      }
      
      console.log("Processing QR code data:", code);
      
      // Extract coupon code using our robust extraction function
      const couponCode = extractCouponCode(code);
      
      if (!couponCode || couponCode.length < 3) {
        throw new Error('Invalid QR code format');
      }
      
      console.log("Extracted coupon code:", couponCode);
      
      // Find the coupon with this code
      const couponsRef = collection(db, 'coupons');
      const q = query(
        couponsRef,
        where('businessId', '==', user.businessId),
        where('code', '==', couponCode)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Coupon not found');
      }
      
      const couponDoc = snapshot.docs[0];
      const couponData = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
      
      if (!couponData.active) {
        throw new Error('This coupon is no longer active');
      }
      
      // Check if coupon is still valid based on dates
      const now = new Date();
      if (couponData.startDate || couponData.endDate) {
        const startDate = couponData.startDate?.toDate ? couponData.startDate.toDate() : new Date(couponData.startDate || 0);
        const endDate = couponData.endDate?.toDate ? couponData.endDate.toDate() : new Date(couponData.endDate || 9999999999999);
        
        if (now < startDate || now > endDate) {
          throw new Error('Coupon has expired or is not yet active');
        }
      }
      
      // Always create a walk-in customer first
      const walkInCustomer: Customer = {
        id: 'walk-in-' + Date.now(),
        businessId: user.businessId,
        firstName: 'Walk-in',
        lastName: 'Customer',
        email: 'walkin@example.com',
        joinDate: Timestamp.now(),
        totalVisits: 1
      } as Customer;
      
      // Set coupon immediately to avoid delays
      setCoupon(couponData);
      setCustomer(walkInCustomer);
      
      // Try to find a better customer in the background
      try {
        // Create a new distribution for this coupon redemption
        await addDoc(collection(db, 'couponDistributions'), {
          couponId: couponData.id,
          customerId: walkInCustomer.id,
          businessId: user.businessId,
          status: 'redeemed',
          createdAt: Timestamp.now(),
          redeemedAt: Timestamp.now(),
          source: 'walk-in-scan'
        });
        
        console.log("Created new distribution record for walk-in customer");
      } catch (distErr) {
        // Non-blocking error - we can still proceed with the coupon
        console.warn("Could not create distribution record:", distErr);
      }
    } catch (err: any) {
      console.error('Error processing coupon:', err);
      setError(err.message || 'Failed to process coupon');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRedeemCoupon = async () => {
    if (!coupon || !customer || !user?.businessId) return;
    
    setIsLoading(true);
    
    try {
      // Update coupon usage count
      await updateDoc(doc(db, 'coupons', coupon.id), {
        usageCount: (coupon.usageCount || 0) + 1
      });
      
      console.log("Updated coupon usage count");
      
      // Success! Navigate back to dashboard
      navigate('/');
    } catch (err: any) {
      console.error('Error redeeming coupon:', err);
      setError(err.message || 'Failed to redeem coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setCoupon(null);
    setCustomer(null);
    setError(null);
  };

  return {
    coupon,
    customer,
    isLoading,
    error,
    handleCodeScanned,
    handleRedeemCoupon,
    resetState
  };
};