/**
 * Component to display businesses that have invited the customer
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Business, getInvitedBusinesses } from '../services/businessDiscoveryService';

interface InvitedBusinessesListProps {
  onBusinessSelect?: (business: Business) => void;
}

const InvitedBusinessesList: React.FC<InvitedBusinessesListProps> = ({ 
  onBusinessSelect 
}) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInvitedBusinesses();
    }
  }, [user]);

  const loadInvitedBusinesses = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const invitedBusinesses = await getInvitedBusinesses(user.uid);
      setBusinesses(invitedBusinesses);
    } catch (err) {
      console.error('Error loading invited businesses:', err);
      setError('Failed to load your invited businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={loadInvitedBusinesses}
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-sm">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't been invited to any businesses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <div 
          key={business.id} 
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center">
              {business.logo ? (
                <img 
                  src={business.logo} 
                  alt={business.name} 
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-700 font-medium text-lg">
                    {business.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                {business.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{business.description}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {business.hasLoyaltyProgram && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Loyalty Program
                </span>
              )}
              {business.hasCoupons && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Coupons Available
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {business.relationshipType === 'invited' ? 'Invited' : business.relationshipType}
              </span>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <Link
                to={`/customer/business/${business.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => onBusinessSelect?.(business)}
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitedBusinessesList;