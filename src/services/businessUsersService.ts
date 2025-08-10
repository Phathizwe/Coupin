import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Business User Types
export interface BusinessUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'staff';
  status: 'active' | 'invited' | 'disabled';
  permissions: {
    manageUsers: boolean;
    manageSettings: boolean;
    manageCoupons: boolean;
    manageCustomers: boolean;
    viewAnalytics: boolean;
  };
  invitedBy?: string;
  invitedAt?: any;
  joinedAt?: any;
  lastActive?: any;
}

// Get all users for a business
export const getBusinessUsers = async (businessId: string): Promise<BusinessUser[]> => {
  try {
    const usersRef = collection(db, 'businesses', businessId, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BusinessUser));
  } catch (error) {
    console.error('Error getting business users:', error);
    throw error;
  }
};

// Get a specific business user
export const getBusinessUser = async (businessId: string, userId: string): Promise<BusinessUser | null> => {
  try {
    const userRef = doc(db, 'businesses', businessId, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as BusinessUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting business user:', error);
    throw error;
  }
};

// Invite a new user to the business
export const inviteBusinessUser = async (
  businessId: string, 
  invitedByUserId: string,
  userData: {
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'staff';
    permissions: {
      manageUsers: boolean;
      manageSettings: boolean;
      manageCoupons: boolean;
      manageCustomers: boolean;
      viewAnalytics: boolean;
    };
  }
): Promise<string> => {
  try {
    // Check if user with this email already exists for this business
    const usersRef = collection(db, 'businesses', businessId, 'users');
    const q = query(usersRef, where('email', '==', userData.email));
    const existingUsers = await getDocs(q);
    
    if (!existingUsers.empty) {
      throw new Error('A user with this email already exists in this business');
    }
    
    // Create new user invitation
    const newUser = {
      ...userData,
      status: 'invited',
      invitedBy: invitedByUserId,
      invitedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'businesses', businessId, 'users'), newUser);
    
    // Also add to invitations collection for tracking
    await addDoc(collection(db, 'invitations'), {
      businessId,
      userId: docRef.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error inviting business user:', error);
    throw error;
  }
};

// Update a business user
export const updateBusinessUser = async (
  businessId: string, 
  userId: string, 
  userData: Partial<BusinessUser>
): Promise<void> => {
  try {
    const userRef = doc(db, 'businesses', businessId, 'users', userId);
    
    // Remove id from the data to update
    const { id, ...dataToUpdate } = userData;
    
    await updateDoc(userRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating business user:', error);
    throw error;
  }
};

// Remove a business user
export const removeBusinessUser = async (businessId: string, userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'businesses', businessId, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error removing business user:', error);
    throw error;
  }
};

// Check if current user is the business owner
export const isBusinessOwner = async (businessId: string, userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'businesses', businessId, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'owner';
    }
    
    // If no specific user document, check if the user is the business creator
    const businessRef = doc(db, 'businesses', businessId);
    const businessDoc = await getDoc(businessRef);
    
    if (businessDoc.exists()) {
      const businessData = businessDoc.data();
      return businessData.createdBy === userId;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if user is business owner:', error);
    return false;
  }
};