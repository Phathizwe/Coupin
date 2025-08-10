import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import LoadingSpinner from '../../customer/components/LoadingSpinner';

interface StorePreviewProps {
  refreshTrigger?: number; // Used to trigger a refresh when settings are updated
}

interface StoreData {
  businessName: string;
  industry: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  couponCount: number;
  colors?: {
    primary: string;
    secondary: string;
  };
}
    
const StorePreview: React.FC<StorePreviewProps> = ({ refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!user?.businessId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the business document as it would appear to customers
        const businessDoc = await getDoc(doc(db, 'businesses', user.businessId));
        
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          
          setStoreData({
            businessName: data.businessName || 'Unknown Business',
            industry: data.industry || 'Not specified',
            logo: data.logo || undefined,
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            website: data.website || '',
            email: data.email || '',
            couponCount: data.couponCount || 0,
            colors: data.colors || { primary: '#3B82F6', secondary: '#10B981' }
          });
        } else {
          setError('Business data not found');
        }
      } catch (err) {
        console.error('Error fetching store preview data:', err);
        setError('Failed to load store preview');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {error || 'Store data not available'}
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the store preview.
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = storeData.colors?.primary || '#3B82F6';
  const secondaryColor = storeData.colors?.secondary || '#10B981';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Customer View Preview</h2>
        <p className="text-sm text-gray-500">This is how your store appears to customers</p>
      </div>
      
      {/* Store Header with primary brand color */}
      <div style={{ backgroundColor: primaryColor + '10' }} className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          {storeData.logo ? (
            <img
              src={storeData.logo}
              alt={storeData.businessName}
              className="h-16 w-16 rounded-full object-cover mr-4 border-2"
              style={{ borderColor: primaryColor }}
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white mr-4"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-2xl">{storeData.businessName.charAt(0)}</span>
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              {storeData.businessName}
            </h1>
            <p className="text-sm text-gray-500">{storeData.industry}</p>
          </div>
        </div>
      </div>
      
      {/* Store Details */}
      <div className="p-6">
        <div className="mb-6">
          <h2 
            className="text-lg font-medium mb-2"
            style={{ color: primaryColor }}
          >
            About
          </h2>
          <p className="text-gray-600">
            {storeData.description || 'No description available for this store.'}
          </p>
        </div>
        
        {storeData.address && (
          <div className="mb-6">
            <h2 
              className="text-lg font-medium mb-2"
              style={{ color: primaryColor }}
            >
              Location
            </h2>
            <p className="text-gray-600">{storeData.address}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h2 
            className="text-lg font-medium mb-2"
            style={{ color: primaryColor }}
          >
            Coupons
          </h2>
          <div 
            className="rounded-lg p-4"
            style={{ backgroundColor: secondaryColor + '15' }}
          >
            <p className="text-gray-700">
              {storeData.couponCount > 0 ? (
                <>This store has <span className="font-medium" style={{ color: secondaryColor }}>{storeData.couponCount}</span> active {storeData.couponCount === 1 ? 'coupon' : 'coupons'}.</>
              ) : (
                'This store has no active coupons at the moment.'
              )}
            </p>
          </div>
        </div>
            </div>
            </div>
  );
};

export default StorePreview;