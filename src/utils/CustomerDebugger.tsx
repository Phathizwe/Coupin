import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { findCustomerByUserId } from '../services/customerLinkingService';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const CustomerDebugger: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [couponDistributions, setCouponDistributions] = useState<any[]>([]);
  const [customerCoupons, setCustomerCoupons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCustomerData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        
        // Find the customer profile linked to this user
        const customer = await findCustomerByUserId(user.uid);
        setCustomerProfile(customer);
        
        if (customer) {
          // Check for coupon distributions (System 1)
          const distributionsRef = collection(db, 'couponDistributions');
          const q1 = query(distributionsRef, where('customerId', '==', customer.id));
          const snapshot1 = await getDocs(q1);
          
          const distributions = snapshot1.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setCouponDistributions(distributions);
          
          // Check for customer coupons (System 2)
          const customerCouponsRef = collection(db, 'customerCoupons');
          const q2 = query(customerCouponsRef, where('customerId', '==', customer.id));
          const snapshot2 = await getDocs(q2);
          
          const coupons = snapshot2.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setCustomerCoupons(coupons);
        } else {
          // Try to find customer by email if user ID link doesn't exist
          if (user.email) {
            const customersRef = collection(db, 'customers');
            const q = query(customersRef, where('email', '==', user.email));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const customerDoc = snapshot.docs[0];
              const customerData = {
                id: customerDoc.id,
                ...customerDoc.data()
              };
              setCustomerProfile(customerData);
              
              // Now check for coupons with this customer ID
              const distributionsRef = collection(db, 'couponDistributions');
              const q1 = query(distributionsRef, where('customerId', '==', customerDoc.id));
              const snapshot1 = await getDocs(q1);
              
              const distributions = snapshot1.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              setCouponDistributions(distributions);
              
              const customerCouponsRef = collection(db, 'customerCoupons');
              const q2 = query(customerCouponsRef, where('customerId', '==', customerDoc.id));
              const snapshot2 = await getDocs(q2);
              
              const coupons = snapshot2.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              setCustomerCoupons(coupons);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error in CustomerDebugger:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkCustomerData();
  }, [user]);

  // Function to copy data to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  if (loading) {
    return <div className="p-4">Loading customer data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Customer Data Debugger</h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">User Info</h3>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify({ 
            uid: user?.uid,
            email: user?.email,
            displayName: user?.displayName
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Customer Profile</h3>
        {customerProfile ? (
          <>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(customerProfile, null, 2)}
            </pre>
            <button 
              onClick={() => copyToClipboard(customerProfile.id)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Copy Customer ID
            </button>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
            <p>No customer profile is linked to your account.</p>
            <p className="mt-2">Possible solutions:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Update your phone number in your profile to match an existing customer</li>
              <li>Ask the business to create a customer profile for you</li>
            </ul>
          </div>
        )}
      </div>
      
      {customerProfile && (
        <>
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Coupon Distributions (System 1)</h3>
            {couponDistributions.length > 0 ? (
              <>
                <p className="mb-2 text-sm text-gray-600">Found {couponDistributions.length} coupon distributions</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(couponDistributions, null, 2)}
                </pre>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                <p>No coupon distributions found for your customer profile.</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Customer Coupons (System 2)</h3>
            {customerCoupons.length > 0 ? (
              <>
                <p className="mb-2 text-sm text-gray-600">Found {customerCoupons.length} customer coupons</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(customerCoupons, null, 2)}
                </pre>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                <p>No customer coupons found for your customer profile.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Recommendations</h3>
        {!customerProfile ? (
          <p>Create a customer profile and link it to your user account first.</p>
        ) : couponDistributions.length === 0 && customerCoupons.length === 0 ? (
          <p>No coupons found in either system. Ask the business to assign coupons to you.</p>
        ) : couponDistributions.length > 0 && customerCoupons.length === 0 ? (
          <p>Coupons found in System 1 (couponDistributions) but not in System 2 (customerCoupons). The dashboard is looking in System 2, which is why you don't see your coupons.</p>
        ) : couponDistributions.length === 0 && customerCoupons.length > 0 ? (
          <p>Coupons found in System 2 (customerCoupons) but not in System 1 (couponDistributions). The CustomerCoupons component is looking in System 1, which is why you don't see your coupons there.</p>
        ) : (
          <p>Coupons found in both systems. You should be able to see them in both places.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDebugger;