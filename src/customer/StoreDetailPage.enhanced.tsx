import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBusinessById } from './services/businessService';
import { Business } from './types/store';
import LoadingSpinner from './components/LoadingSpinner';

const StoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoreDetails = async () => {
      if (!storeId) {
        setError('Store ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const storeDetails = await fetchBusinessById(storeId);
        
        if (storeDetails) {
          setStore(storeDetails);
        } else {
          setError('Store not found');
        }
      } catch (err) {
        console.error('Error loading store details:', err);
        setError('Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    loadStoreDetails();
  }, [storeId]);

  const handleViewCoupons = () => {
    if (store) {
      navigate(`/customer/coupons?businessId=${store.id}`);
    }
  };

  const handleBack = () => {
    navigate('/customer/stores');
  };

  // Get the store's colors or use defaults
  const getPrimaryColor = () => store?.colors?.primary || '#3B82F6';
  const getSecondaryColor = () => store?.colors?.secondary || '#10B981';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {error || 'Store not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the store you're looking for.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#3B82F6',
              outlineColor: '#3B82F6'
            }}
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  const businessName = store.businessName || store.name || 'Business';
  const couponCount = store.couponCount || 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Store Header */}
      <div 
        className="p-6 border-b"
        style={{ backgroundColor: primaryColor + '10', borderColor: primaryColor + '40' }}
      >
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-1 rounded-full hover:bg-gray-200"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {store.logo ? (
            <img
              src={store.logo}
              alt={businessName}
              className="h-16 w-16 rounded-full object-cover mr-4 border-2"
              style={{ borderColor: primaryColor }}
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white mr-4"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-2xl">{businessName.charAt(0)}</span>
            </div>
          )}
          
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              {businessName}
            </h1>
            <p className="text-sm text-gray-500">{store.industry || 'General'}</p>
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
            {store.description || 'No description available for this store.'}
          </p>
        </div>
        
        {store.address && (
          <div className="mb-6">
            <h2 
              className="text-lg font-medium mb-2"
              style={{ color: primaryColor }}
            >
              Location
            </h2>
            <p className="text-gray-600">{store.address}</p>
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
            className="rounded-lg p-4 flex items-center justify-between"
            style={{ backgroundColor: primaryColor + '10' }}
          >
            <div>
              <p className="text-gray-600">
                {couponCount > 0 ? (
                  <>This store has <span className="font-medium" style={{ color: secondaryColor }}>{couponCount}</span> active {couponCount === 1 ? 'coupon' : 'coupons'}.</>
                ) : (
                  'This store has no active coupons at the moment.'
                )}
              </p>
            </div>
            {couponCount > 0 && (
              <button
                onClick={handleViewCoupons}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: primaryColor,
                  outlineColor: primaryColor
                }}
              >
                View Coupons
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;