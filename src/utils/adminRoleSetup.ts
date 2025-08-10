import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User } from 'firebase/auth';
import { ExtendedUser } from '@/contexts/auth/types';

/**
 * Sets the user as admin by email
 * @param email The email address of the user to set as admin
 */
export const setUserAsAdmin = async (email: string): Promise<boolean> => {
  try {
    // Query for the user document by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error(`No user found with email: ${email}`);
      return false;
    }
    
    // Update the user's role to admin
    const userDoc = querySnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      role: 'admin'
    });
    
    console.log(`User ${email} has been set as admin`);
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
};

/**
 * Checks if the current user is an admin and sets up the admin role
 * for phathizwe@gmail.com if they sign in
 */
export const setupAdminUser = async (user: User | ExtendedUser | null): Promise<void> => {
  if (!user) return;
  
  // Check if the user is phathizwe@gmail.com
  if (user.email === 'phathizwe@gmail.com') {
    try {
      // Get the user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let roleUpdated = false;
      
      // If user exists in Firestore
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // If user is not already an admin, update their role
        if (userData.role !== 'admin') {
          await updateDoc(userDocRef, {
            role: 'admin',
            updatedAt: new Date()
          });
          console.log('User phathizwe@gmail.com has been set as admin');
          roleUpdated = true;
        }
      } 
      // If user doesn't exist in Firestore yet, create a new document
      else {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin User',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Created new admin user for phathizwe@gmail.com');
        roleUpdated = true;
      }
      
      // If the role was updated, force a page reload to refresh the auth state
      if (roleUpdated) {
        console.log('Role was updated, reloading page to refresh auth state...');
        // Store a flag in localStorage to indicate we're reloading after role update
        localStorage.setItem('adminRoleUpdated', 'true');
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error setting up admin user:', error);
    }
  }
};