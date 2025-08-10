import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessId: string;
  businessName?: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Try to fetch user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              setUser({
                id: firebaseUser.uid,
                ...userDoc.data() as Omit<User, 'id'>
              });
            } else {
              // If no user document exists, use default demo user
              setUser(getDemoUser(firebaseUser.uid));
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Fallback to demo user
            setUser(getDemoUser(firebaseUser.uid));
          }
        } else {
          // If not authenticated, use demo user for development
          if (process.env.NODE_ENV === 'development') {
            setUser(getDemoUser('demo-user-id'));
          } else {
            setUser(null);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Auth state error:', err);
        setError('Authentication error. Please try again later.');
        setUser(getDemoUser('demo-user-id')); // Fallback to demo user
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};

// Demo user for development purposes
const getDemoUser = (uid: string): User => ({
  id: uid,
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex@example.com',
  businessId: 'demo-business-id',
  businessName: 'Alex\'s Café'
});