import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../../customer/types/store';

interface StoreCardProps {
  store: Business;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const navigate = useNavigate();

  // Get primary and secondary colors from store, or use defaults
  const primaryColor = store.colors?.primary || '#3B82F6';
  const secondaryColor = store.colors?.secondary || '#10B981';

  // Handler for View Store button
  const handleViewStore = () => {
    navigate(`/customer/stores/${store.id}`);
  };

  // Handler for View Coupons button
  const handleViewCoupons = () => {
    navigate(`/customer/coupons?businessId=${store.id}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="p-4 border-b border-gray-200 flex items-center"
        style={{ backgroundColor: primaryColor + '10' }}
        >
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.businessName}
            className="h-10 w-10 rounded-full object-cover mr-3 border-2"
            style={{ borderColor: primaryColor }}
          />
        ) : (
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-white mr-3"
            style={{ backgroundColor: primaryColor }}
        >
            {store.businessName.charAt(0)}
      </div>
        )}
        <div>
          <h3 className="font-medium" style={{ color: primaryColor }}>
            {store.businessName}
          </h3>
          <p className="text-xs text-gray-500">{store.industry}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{store.description}</p>
        <p className="text-xs text-gray-500 mb-4">{store.address}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {store.couponCount > 0 ? (
              <>
                <span className="font-medium" style={{ color: secondaryColor }}>
                  {store.couponCount}
                </span> {store.couponCount === 1 ? 'coupon' : 'coupons'} available
              </>
            ) : (
              <span className="text-gray-500">No coupons available</span>
            )}
          </span>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            borderColor: primaryColor + '40', 
            color: primaryColor,
            outlineColor: primaryColor
          }}
          onClick={handleViewStore}
        >
          View Store
        </button>
        <button
          className={`inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
            store.couponCount > 0 
              ? 'border-transparent text-white hover:opacity-90' 
              : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{ 
            backgroundColor: store.couponCount > 0 ? primaryColor : undefined,
            outlineColor: primaryColor
          }}
          disabled={store.couponCount === 0}
          onClick={store.couponCount > 0 ? handleViewCoupons : undefined}
        >
          View Coupons
        </button>
      </div>
    </div>
  );
};

export default StoreCard;