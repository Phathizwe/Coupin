import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getCoupons } from '../../services/couponService';
import { Coupon } from '../../types';
import { debugCouponIssues, fixBusinessContext } from '../../debug/CouponDebugger';
import { toast } from 'react-hot-toast';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * This is a debugging version of the BusinessCoupons component
 * It will help identify why coupons aren't showing up for certain users
 */
const CouponsDebug: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [fixAttempted, setFixAttempted] = useState(false);

  // Run the debugger when component mounts
  useEffect(() => {
    if (user) {
      // Run the debugger
      debugCouponIssues(user, businessProfile);
      
      // Store debug info
      setDebugInfo({
        user: {
          uid: user.uid,
          email: user.email,
          role: user.role,
          businessId: user.businessId
        },
        businessProfile: businessProfile ? {
          businessId: businessProfile.businessId,
          businessName: businessProfile.businessName
        } : null
      });
    }
  }, [user, businessProfile]);

  // Fetch coupons on component mount
  useEffect(() => {
    if (user?.businessId) {
      console.log('[CouponsDebug] Fetching coupons with user.businessId:', user.businessId);
      fetchCouponsWithBusinessId(user.businessId);
    } else if (businessProfile?.businessId) {
      console.log('[CouponsDebug] Fetching coupons with businessProfile.businessId:', businessProfile.businessId);
      fetchCouponsWithBusinessId(businessProfile.businessId);
    } else {
      console.log('[CouponsDebug] No business ID available');
      setLoading(false);
    }
  }, [user, businessProfile]);

  // Function to fetch coupons with a specific business ID
  const fetchCouponsWithBusinessId = async (businessId: string) => {
    setLoading(true);
    try {
      console.log('[CouponsDebug] Fetching coupons for business:', businessId);
      const fetchedCoupons = await getCoupons(businessId);
      console.log('[CouponsDebug] Fetched coupons:', fetchedCoupons);
      setCoupons(fetchedCoupons || []);
    } catch (error) {
      console.error('[CouponsDebug] Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to attempt fixing business context
  const attemptFix = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updatedUser = await fixBusinessContext(user);
      if (updatedUser && updatedUser.businessId) {
        console.log('[CouponsDebug] Fixed user context:', updatedUser);
        toast.success('Updated business context. Fetching coupons...');
        await fetchCouponsWithBusinessId(updatedUser.businessId);
      } else {
        toast.error('Could not fix business context');
      }
    } catch (error) {
      console.error('[CouponsDebug] Error fixing context:', error);
      toast.error('Error fixing business context');
    } finally {
      setLoading(false);
      setFixAttempted(true);
    }
  };

  // Try fetching with all known business IDs
  const fetchAllPossibleCoupons = async () => {
    setLoading(true);
    try {
      const couponsRef = collection(db, 'coupons');
      const allCouponsSnapshot = await getDocs(couponsRef);
      const allCoupons = allCouponsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Coupon[];
      
      console.log('[CouponsDebug] All coupons:', allCoupons);
      
      // Group by business ID
      const couponsByBusiness = allCoupons.reduce((acc: Record<string, Coupon[]>, coupon: Coupon) => {
        const businessId = coupon.businessId;
        if (!acc[businessId]) {
          acc[businessId] = [];
        }
        acc[businessId].push(coupon);
        return acc;
      }, {});
      
      console.log('[CouponsDebug] Coupons by business:', couponsByBusiness);
      
      // Show a selection UI if multiple businesses found
      if (Object.keys(couponsByBusiness).length > 0) {
        const firstBusinessId = Object.keys(couponsByBusiness)[0];
        setCoupons(couponsByBusiness[firstBusinessId]);
        toast.success(`Showing coupons for business ID: ${firstBusinessId}`);
      } else {
        toast.error('No coupons found in database');
      }
    } catch (error) {
      console.error('[CouponsDebug] Error fetching all coupons:', error);
      toast.error('Error fetching all coupons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coupon Debugger</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h2>
        <pre className="bg-white p-3 rounded overflow-auto max-h-40 text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => fetchAllPossibleCoupons()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Fetch All Coupons
        </button>
        
        <button
          onClick={attemptFix}
          disabled={fixAttempted}
          className={`${
            fixAttempted 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white px-4 py-2 rounded`}
        >
          Attempt Fix Business Context
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Reload Page
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Coupons Found: {coupons.length}</h2>
        
        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-lg text-gray-600">No coupons found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg">{coupon.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                <div className="flex justify-between text-sm">
                  <span>Type: {coupon.type}</span>
                  <span>Value: {coupon.value}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Business ID: {coupon.businessId}</p>
                  <p>Coupon ID: {coupon.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check if the user has the correct business ID</li>
          <li>Verify that coupons exist for this business ID</li>
          <li>Try fetching all coupons to see what's available</li>
          <li>Check user roles and permissions</li>
          <li>Look for any filtering that might exclude coupons</li>
        </ol>
      </div>
    </div>
  );
};

export default CouponsDebug;