import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Component to correct routing for business users who are incorrectly sent to customer dashboard
 * This component should be placed on the customer dashboard page
 */
const BusinessRouteCorrector: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a business user incorrectly routed to customer dashboard
    const isBusinessUser = 
      user?.role === 'business' || 
      (user?.businessId && typeof user.businessId === 'string' && user.businessId.trim() !== '') ||
      (user?.businesses && Array.isArray(user.businesses) && user.businesses.length > 0) ||
      (businessProfile && businessProfile.businessId);

    if (isBusinessUser) {
      console.log('[BusinessRouteCorrector] Detected business user on customer dashboard, redirecting to business dashboard');
      navigate('/business/dashboard', { replace: true });
    } else {
      console.log('[BusinessRouteCorrector] User is correctly on customer dashboard');
    }
  }, [user, businessProfile, navigate]);

  // This component doesn't render anything
  return null;
};

export default BusinessRouteCorrector;