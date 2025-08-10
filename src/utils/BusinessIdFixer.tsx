import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const BusinessIdFixer: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [targetBusinessId, setTargetBusinessId] = useState<string>('nmmUO1gFlcZQV1LMkwKPxbYbes83');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setUserInfo({
        uid: user.uid,
        email: user.email,
        businessId: user.businessId,
        currentBusinessId: user.currentBusinessId,
        businessProfile: businessProfile
      });
    }
  }, [user, businessProfile]);

  const fixBusinessId = async () => {
    if (!user?.uid) {
      setStatus('No user is logged in');
      return;
    }

    setLoading(true);
    setStatus('Fixing business ID...');

    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          businessId: targetBusinessId,
          currentBusinessId: targetBusinessId,
          businesses: [targetBusinessId]
        });
        
        setStatus('Business ID updated successfully! Please refresh the page.');
        
        // Force reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus('User document not found');
      }
    } catch (error) {
      console.error('Error fixing business ID:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-bold text-red-700 mb-2">Business ID Fixer</h3>
      
      <div className="mb-4">
        <p className="text-red-700 font-semibold">Current User Info:</p>
        <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Business ID:
        </label>
        <input
          type="text"
          value={targetBusinessId}
          onChange={(e) => setTargetBusinessId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          This should match the businessId in your Firestore coupons collection
        </p>
      </div>
      
      <button
        onClick={fixBusinessId}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Fixing...' : 'Fix Business ID'}
      </button>
      
      {status && (
        <div className="mt-3 p-2 bg-white border rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <p className="mt-4 text-xs text-red-700">
        <strong>Warning:</strong> This will update your user account to use the business ID from the coupons in the database.
        Only use this if you're sure that's the correct business ID.
      </p>
    </div>
  );
};

export default BusinessIdFixer;