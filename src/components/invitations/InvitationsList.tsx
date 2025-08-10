import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Invitation,
  getInvitationsByEmail,
  acceptInvitation,
  declineInvitation
} from '../../services/invitationService';

interface InvitationsListProps {
  onInvitationAccepted?: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ onInvitationAccepted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const userInvitations = await getInvitationsByEmail(user.email);
        setInvitations(userInvitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitations();
  }, [user]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    if (!user) return;
    
    try {
      setProcessing(invitation.id);
      await acceptInvitation(invitation, user.uid);
      
      // Remove from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      // Notify parent component
      if (onInvitationAccepted) {
        onInvitationAccepted();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    try {
      setProcessing(invitation.id);
      await declineInvitation(invitation.id);
      
      // Remove from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert('Failed to decline invitation. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return null; // Don't show anything if there are no invitations
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Business Invitations</h2>
      
      <div className="space-y-4">
        {invitations.map(invitation => (
          <div 
            key={invitation.id} 
            className="border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="mb-4 md:mb-0">
              <p className="font-medium">
                You've been invited to join a business
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{invitation.name}</span> has invited you to join their business as a <span className="capitalize">{invitation.role}</span>
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeclineInvitation(invitation)}
                disabled={processing === invitation.id}
                className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 ${
                  processing === invitation.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Decline
              </button>
              <button
                onClick={() => handleAcceptInvitation(invitation)}
                disabled={processing === invitation.id}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  processing === invitation.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processing === invitation.id ? 'Processing...' : 'Accept'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitationsList;