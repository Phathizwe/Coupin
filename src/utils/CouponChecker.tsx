import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface CouponCheckerProps {
  couponId: string;
  customerId: string;
}

const CouponChecker: React.FC<CouponCheckerProps> = ({ couponId, customerId }) => {
  const [loading, setLoading] = useState(true);
  const [couponData, setCouponData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCoupon = async () => {
      try {
        setLoading(true);
        
        // Get the coupon document
        const couponRef = doc(db, 'coupons', couponId);
        const couponSnap = await getDoc(couponRef);
        
        if (couponSnap.exists()) {
          setCouponData({
            id: couponSnap.id,
            ...couponSnap.data()
          });
        } else {
          setError(`Coupon with ID ${couponId} not found`);
        }
      } catch (err: any) {
        console.error('Error checking coupon:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    checkCoupon();
  }, [couponId]);

  if (loading) {
    return <div>Loading coupon data...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-2">Coupon Details</h3>
      
      {couponData ? (
        <div>
          <div className="mb-4">
            <h4 className="font-medium text-gray-700">Coupon Information</h4>
            <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(couponData, null, 2)}
            </pre>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg mb-4">
            <h4 className="font-bold text-lg">{couponData.title || 'Coupon'}</h4>
            <p className="text-gray-600">{couponData.description || 'No description'}</p>
            <div className="mt-3 p-2 bg-gray-100 rounded">
              <span className="font-mono font-bold">{couponData.code || 'NO_CODE'}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Type: {couponData.type || 'unknown'}</span>
              <span>Value: {couponData.value || '0'}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            This coupon is assigned to customer ID: {customerId}
          </p>
        </div>
      ) : (
        <p>No coupon data found</p>
      )}
    </div>
  );
};

export default CouponChecker;