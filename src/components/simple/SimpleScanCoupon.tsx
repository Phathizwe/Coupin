import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Coupon, Customer } from '../../types';
import ScannerView from './components/ScannerView';
import ScanErrorState from './components/ScanErrorState';
import CouponDetails from './components/CouponDetails';
import LoadingState from './components/LoadingState';
import SimpleLayout from '../../layouts/SimpleLayout';

const SimpleScanCoupon: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const handleCodeScanned = async (code: string) => {
    setScanning(false);
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user?.businessId) {
        throw new Error('Business ID not found');
      }
      
      // Find the coupon with this code
      const couponsRef = collection(db, 'coupons');
      const q = query(
        couponsRef,
        where('businessId', '==', user.businessId),
        where('code', '==', code),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Coupon not found or expired');
      }
      
      const couponDoc = snapshot.docs[0];
      const couponData = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
      
      // Check if coupon is still valid
      const now = new Date();
      const startDate = couponData.startDate?.toDate ? couponData.startDate.toDate() : new Date(couponData.startDate);
      const endDate = couponData.endDate?.toDate ? couponData.endDate.toDate() : new Date(couponData.endDate);
      
      if (now < startDate || now > endDate) {
        throw new Error('Coupon has expired or is not yet active');
      }
      
      // Find the distribution to get the customer
      const distRef = collection(db, 'couponDistributions');
      const distQuery = query(
        distRef,
        where('couponId', '==', couponDoc.id),
        where('status', '==', 'sent')
      );
      
      const distSnapshot = await getDocs(distQuery);
      
      if (distSnapshot.empty) {
        throw new Error('Coupon distribution not found');
      }
      
      const distDoc = distSnapshot.docs[0];
      const distData = distDoc.data();
      
      // Get customer info
      const customerDoc = await getDoc(doc(db, 'customers', distData.customerId));
      
      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }
      
      const customerData = { id: customerDoc.id, ...customerDoc.data() } as Customer;
      
      setCoupon(couponData);
      setCustomer(customerData);
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
      // Find the distribution
      const distRef = collection(db, 'couponDistributions');
      const distQuery = query(
        distRef,
        where('couponId', '==', coupon.id),
        where('customerId', '==', customer.id),
        where('status', '==', 'sent')
      );
      
      const distSnapshot = await getDocs(distQuery);
      
      if (distSnapshot.empty) {
        throw new Error('Coupon distribution not found');
      }
      
      const distDoc = distSnapshot.docs[0];
      
      // Update distribution status
      await updateDoc(doc(db, 'couponDistributions', distDoc.id), {
        status: 'redeemed',
        redeemedAt: Timestamp.now()
      });
      
      // Update coupon usage count
      await updateDoc(doc(db, 'coupons', coupon.id), {
        usageCount: (coupon.usageCount || 0) + 1
      });
      
      // Update customer stats
      await updateDoc(doc(db, 'customers', customer.id), {
        lastVisit: Timestamp.now(),
        totalVisits: (customer.totalVisits || 0) + 1
      });
      
      // Success! Navigate back to simple dashboard
      navigate('/business/dashboard');
    } catch (err: any) {
      console.error('Error redeeming coupon:', err);
      setError(err.message || 'Failed to redeem coupon');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setCoupon(null);
    setCustomer(null);
    setError(null);
    setScanning(true);
  };
  
  // Handle back button to always go to simple dashboard
  const handleBackClick = () => {
    navigate('/business/dashboard');
  };

  const content = (
    <div className="flex flex-col h-screen bg-black">
      {/* Header with gradient when not scanning */}
      {!scanning && (
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-8 pb-12 px-6 rounded-b-3xl shadow-lg z-10">
          <div className="flex items-center">
            <button 
              onClick={handleBackClick}
              className="text-white mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Scan Coupon</h1>
          </div>
        </header>
      )}
      
      {/* Scanner View Header - Minimal when scanning */}
      {scanning && (
        <header className="p-4 flex items-center z-10 absolute top-0 left-0 right-0">
          <button 
            onClick={handleBackClick}
            className="text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Scan Coupon</h1>
        </header>
      )}
      
      {/* Scanner View - Full screen */}
      {scanning && (
        <ScannerView onCodeScanned={handleCodeScanned} />
      )}
      
      {/* Coupon Details - Shifted up to overlay with header */}
      {!scanning && (
        <div className="flex-1 -mt-6">
          <div className="bg-white rounded-t-3xl shadow-lg h-full p-6 flex flex-col">
            {error ? (
              <ScanErrorState errorMessage={error} onReset={handleReset} />
            ) : isLoading ? (
              <LoadingState />
            ) : coupon && customer ? (
              <CouponDetails 
                coupon={coupon} 
                customer={customer} 
                isLoading={isLoading} 
                onRedeem={handleRedeemCoupon} 
              />
            ) : null}
          </div>
        </div>
      )}
      
      {/* Floating scan button when not scanning */}
      {!scanning && !isLoading && error && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleReset}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  // On mobile, render directly; on desktop, wrap with SimpleLayout
  return isMobile ? content : <SimpleLayout>{content}</SimpleLayout>;
};

export default SimpleScanCoupon;