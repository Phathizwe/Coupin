import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import InvitationsList from '../invitations/InvitationsList';

const InvitationsChecker: React.FC = () => {
  const { checkForInvitations, fetchUserBusinesses } = useAuth();
  const [hasInvitations, setHasInvitations] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkInvitations = async () => {
      try {
        setLoading(true);
        const hasInvites = await checkForInvitations();
        setHasInvitations(hasInvites);
      } catch (error) {
        console.error('Error checking invitations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkInvitations();
  }, [checkForInvitations]);
  
  const handleInvitationAccepted = async () => {
    // Refresh the list of businesses after accepting an invitation
    await fetchUserBusinesses();
    setHasInvitations(false);
  };
  
  if (loading) {
    return null;
  }
  
  return (
    <>
      {hasInvitations && (
        <InvitationsList onInvitationAccepted={handleInvitationAccepted} />
      )}
    </>
  );
};

export default InvitationsChecker;