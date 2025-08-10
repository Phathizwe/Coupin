import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * A simplified dashboard specifically designed for customers 
 * who are physically at a TYCA store location
 */
const SimplifiedStoreDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('there');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoyaltyPrograms, setHasLoyaltyPrograms] = useState(false);
  const [hasCoupons, setHasCoupons] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        // Get user's name
        if (user.displayName) {
          setUserName(user.displayName.split(' ')[0]);
        }
        
        // Check if user has any coupons or loyalty programs
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check for customer ID
          if (userData.customerId) {
            const customerDoc = await getDoc(doc(db, 'customers', userData.customerId));
            if (customerDoc.exists()) {
              const customerData = customerDoc.data();
              
              // Check for loyalty programs
              setHasLoyaltyPrograms(
                customerData.loyaltyPoints && 
                Object.keys(customerData.loyaltyPoints).length > 0
              );
              
              // We'll assume they have coupons if they're a customer
              setHasCoupons(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to start saving? Let's make it happen! 💪
        </p>
      </div>
      
      {/* Main action buttons */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Get My Coupon button */}
        <div 
          onClick={() => navigate('/customer/dashboard')}
          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
        >
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">🎟️</span> Get My Coupons
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {hasCoupons 
                ? "View and redeem your available coupons" 
                : "Discover exclusive deals and discounts"}
            </p>
            <div className="flex justify-end">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        
        {/* Pull out my Loyalty Card button */}
        <div 
          onClick={() => navigate('/customer/loyalty')}
          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
        >
          <div className="bg-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">🏆</span> My Loyalty Card
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {hasLoyaltyPrograms 
                ? "View your loyalty points and rewards" 
                : "Join loyalty programs to earn rewards"}
            </p>
            <div className="flex justify-end">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        
        {/* Store mode indicator */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8 text-center">
          <p className="text-yellow-700 flex items-center justify-center">
            <span className="mr-2">📍</span> Store Mode Active
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            Quick access to your coupons and loyalty cards
          </p>
        </div>
      </div>
      
      {/* Return to full dashboard link */}
      <div className="text-center mt-8">
        <Link 
          to="/customer/dashboard" 
          className="text-indigo-600 font-medium hover:text-indigo-800"
        >
          Go to Full Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SimplifiedStoreDashboard;