import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Invitation Types
export interface Invitation {
  id: string;
  businessId: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'staff';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
  acceptedAt?: any;
}

// Get invitations for a specific email
export const getInvitationsByEmail = async (email: string): Promise<Invitation[]> => {
  try {
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef, 
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invitation));
  } catch (error) {
    console.error('Error getting invitations:', error);
    throw error;
  }
};

// Accept an invitation
export const acceptInvitation = async (
  invitation: Invitation, 
  currentUserId: string
): Promise<void> => {
  try {
    // Update the invitation status
    const invitationRef = doc(db, 'invitations', invitation.id);
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });
    
    // Update the user in the business - use setDoc instead of updateDoc to ensure all fields are set
    const businessUserRef = doc(db, 'businesses', invitation.businessId, 'users', currentUserId);
    await setDoc(businessUserRef, {
        email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      status: 'active',
      permissions: {
        manageUsers: invitation.role === 'admin',
        manageSettings: invitation.role === 'admin',
        manageCoupons: invitation.role === 'admin' || invitation.role === 'staff',
        manageCustomers: invitation.role === 'admin' || invitation.role === 'staff',
        viewAnalytics: invitation.role === 'admin' || invitation.role === 'staff'
      },
      joinedAt: serverTimestamp(),
      userId: currentUserId // Link to the actual Firebase user ID
    });
    
    // Add the business ID to the user's profile
    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // If the user document exists, update it
      const userData = userDoc.data();
      
      // Add this business to the user's businesses array
      const businesses = userData.businesses || [];
      if (!businesses.includes(invitation.businessId)) {
        businesses.push(invitation.businessId);
    }
      
      // Important: Set the role as 'staff' for this specific business
      // This ensures the user is treated as staff, not a business owner
      await updateDoc(userRef, {
        businesses,
        role: 'staff', // Explicitly set role as staff
        currentBusinessId: invitation.businessId, // Set current business to the one they were invited to
      updatedAt: serverTimestamp()
    });
    } else {
      // If the user document doesn't exist, create it
      await setDoc(userRef, {
        uid: currentUserId,
        email: invitation.email,
        displayName: invitation.name,
        role: 'staff', // Explicitly set role as staff
        businesses: [invitation.businessId],
        currentBusinessId: invitation.businessId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  }
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

// Decline an invitation
export const declineInvitation = async (invitationId: string): Promise<void> => {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'declined',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    throw error;
  }
};