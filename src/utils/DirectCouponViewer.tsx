import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DirectCouponViewerProps {
  customerId: string;
}

// Define the structure of distribution data
interface CouponDistribution {
  id: string;
  customerId?: string;
  couponId?: string;
  businessId?: string;
  status?: string;
  sentAt?: any;
  redeemedAt?: any;
  [key: string]: any; // Allow for additional properties
}

const DirectCouponViewer: React.FC<DirectCouponViewerProps> = ({ customerId }) => {
  const [loading, setLoading] = useState(true);
  const [distributions, setDistributions] = useState<CouponDistribution[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        
        // Direct query to couponDistributions
        const distributionsRef = collection(db, 'couponDistributions');
        const q = query(distributionsRef, where('customerId', '==', customerId));
        const snapshot = await getDocs(q);
        
        console.log(`Found ${snapshot.size} distributions for customer ${customerId}`);
        
        const distributionsData: CouponDistribution[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDistributions(distributionsData);
        
        // Fetch the actual coupon details
        const couponDetails = [];
        
        for (const dist of distributionsData) {
          if (dist.couponId) {
            try {
              const couponRef = doc(db, 'coupons', dist.couponId);
              const couponSnap = await getDoc(couponRef);
              
              if (couponSnap.exists()) {
                couponDetails.push({
                  id: couponSnap.id,
                  ...couponSnap.data(),
                  distributionId: dist.id,
                  status: dist.status
                });
              } else {
                console.log(`Coupon ${dist.couponId} not found`);
              }
            } catch (err) {
              console.error(`Error fetching coupon ${dist.couponId}:`, err);
            }
          }
        }
        
        setCoupons(couponDetails);
        
      } catch (err: any) {
        console.error('Error in DirectCouponViewer:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [customerId]);

  if (loading) {
    return <div className="p-4">Loading coupon data directly...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Direct Coupon Data</h3>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Coupon Distributions ({distributions.length})</h4>
        {distributions.length > 0 ? (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(distributions, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">No coupon distributions found</p>
        )}
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Coupon Details ({coupons.length})</h4>
        {coupons.length > 0 ? (
          <div className="space-y-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <h5 className="font-bold text-lg">{coupon.title || 'Untitled Coupon'}</h5>
                <p className="text-gray-600">{coupon.description || 'No description'}</p>
                
                <div className="mt-3 p-2 bg-gray-100 rounded">
                  <p className="text-sm text-gray-500">Coupon Code:</p>
                  <p className="font-mono text-lg font-bold">{coupon.code || 'NO_CODE'}</p>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Type:</p>
                    <p>{coupon.type || 'unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Value:</p>
                    <p>{coupon.value || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status:</p>
                    <p>{coupon.status || 'unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID:</p>
                    <p className="font-mono text-xs">{coupon.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No coupon details found</p>
        )}
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> This component directly queries the Firestore database, bypassing any application logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectCouponViewer;