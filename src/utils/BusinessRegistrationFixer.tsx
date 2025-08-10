import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const BusinessRegistrationFixer: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Checking registration status...');
  const [fixed, setFixed] = useState<boolean>(false);

  useEffect(() => {
    const checkAndFixRegistration = async () => {
      if (!user || !user.uid) {
        setStatus('No authenticated user found. Please log in again.');
        return;
      }

      try {
        setStatus(`Checking user document for ${user.uid}...`);
        
        // Check if user document exists
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          setStatus('User document not found. Creating user document...');
          
          // Create user document
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: 'business',
            createdAt: new Date()
          });
          
          setStatus('User document created successfully.');
        }
        
        // Get user data
        const userData = userDoc.exists() ? userDoc.data() : { role: 'business' };
        
        // Check if user has a business role
        if (userData.role !== 'business') {
          setStatus('User role is not set to business. Updating role...');
          
          await updateDoc(userDocRef, {
            role: 'business'
          });
          
          setStatus('User role updated to business.');
        }
        
        // Check if user has a business ID
        let businessId = userData.businessId || userData.currentBusinessId;
        
        if (!businessId) {
          setStatus('No business ID found. Creating new business...');
          
          // Create a new business
          const businessRef = doc(collection(db, 'businesses'));
          businessId = businessRef.id;
          
          await setDoc(businessRef, {
            businessId: businessId,
            businessName: user.displayName || 'My Business',
            industry: '',
            createdAt: new Date(),
            ownerId: user.uid,
            active: true
          });
          
          // Update user with business reference
          await updateDoc(userDocRef, {
            businessId: businessId,
            businesses: [businessId],
            currentBusinessId: businessId
          });
          
          setStatus(`New business created with ID: ${businessId}`);
        } else {
          // Check if business document exists
          const businessDocRef = doc(db, 'businesses', businessId);
          const businessDoc = await getDoc(businessDocRef);
          
          if (!businessDoc.exists()) {
            setStatus(`Business document not found for ID: ${businessId}. Creating business document...`);
            
            // Create business document
            await setDoc(businessDocRef, {
              businessId: businessId,
              businessName: user.displayName || 'My Business',
              industry: '',
              createdAt: new Date(),
              ownerId: user.uid,
              active: true
            });
            
            setStatus('Business document created successfully.');
          }
        }
        
        // Check if user has the business in their businesses array
        if (!userData.businesses || !userData.businesses.includes(businessId)) {
          setStatus('Updating user businesses array...');
          
          const businesses = userData.businesses || [];
          businesses.push(businessId);
          
          await updateDoc(userDocRef, {
            businesses: businesses,
            currentBusinessId: businessId
          });
          
          setStatus('User businesses array updated.');
        }
        
        setStatus('Registration fixed successfully! Redirecting to dashboard...');
        setFixed(true);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/business/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error fixing registration:', error);
        setStatus(`Error fixing registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    checkAndFixRegistration();
  }, [user, navigate]);
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Business Registration Repair</h1>
      <div className="mb-4">
        <p className="text-gray-700">{status}</p>
      </div>
      {fixed && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Registration fixed successfully! Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default BusinessRegistrationFixer;