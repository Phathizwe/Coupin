// CouponDebugger.js
// Add this file to your project and import it in your BusinessCoupons.tsx component

import { db } from '../config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export const debugCouponIssues = (user, businessProfile) => {
  console.log("=== COUPON DEBUGGER STARTED ===");
  console.log("Current user:", user);
  console.log("Business profile:", businessProfile);
  console.log("User's businessId:", user?.businessId);
  console.log("Business profile businessId:", businessProfile?.businessId);
  
  // Log all coupons regardless of business ID
  const fetchAllCoupons = async () => {
    try {
      const couponsRef = collection(db, 'coupons');
      const allCouponsSnapshot = await getDocs(couponsRef);
      
      console.log("All coupons in database:", allCouponsSnapshot.docs.map(doc => ({
        id: doc.id,
        businessId: doc.data().businessId,
        title: doc.data().title
      })));
      
      // Check if any coupons match the user's business ID
      const userBusinessId = user?.businessId || businessProfile?.businessId;
      const matchingCoupons = allCouponsSnapshot.docs.filter(doc => 
        doc.data().businessId === userBusinessId
      );
      
      console.log(`Found ${matchingCoupons.length} coupons matching business ID: ${userBusinessId}`);
      
      if (matchingCoupons.length === 0 && userBusinessId) {
        console.log("No coupons found for this business ID. This might be the issue!");
      }
      
      // Check for permission issues
      if (user && !user.businessId && businessProfile?.businessId) {
        console.log("WARNING: User does not have a businessId property but businessProfile does.");
        console.log("This might indicate a permission/role issue.");
      }
      
      // Check for business context issues
      const uniqueBusinessIds = [...new Set(allCouponsSnapshot.docs.map(doc => doc.data().businessId))];
      console.log("Unique business IDs in coupons collection:", uniqueBusinessIds);
      
      if (uniqueBusinessIds.length > 1) {
        console.log("Multiple businesses found in coupons collection.");
        console.log("Make sure the application is using the correct business context.");
      }
    } catch (error) {
      console.error("Error fetching all coupons:", error);
    }
  };
  
  fetchAllCoupons();
  
  // Additional debugging for user roles and permissions
  if (user) {
    console.log("User role:", user.role);
    console.log("Is user a business owner?", user.role === 'business');
    console.log("Is user an employee?", user.role === 'employee' || user.role === 'staff');
  }
  
  console.log("=== COUPON DEBUGGER COMPLETED ===");
};

// Function to check if a user should have access to a specific business
export const checkBusinessAccess = (user, businessId) => {
  if (!user) return false;
  
  // Direct business owner
  if (user.businessId === businessId) return true;
  
  // Employee with access to this business
  if (user.employeeOf && user.employeeOf.includes(businessId)) return true;
  
  // User with business profile matching this business
  if (user.businessProfile && user.businessProfile.businessId === businessId) return true;
  
  return false;
};

// Function to fix business context issues
export const fixBusinessContext = async (user) => {
  if (!user) return null;
  
  try {
    // If user is an employee, find their employer's business
    if (user.role === 'employee' || user.role === 'staff') {
      // Check users collection for employee info
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData && userData.employeeOf) {
        const employerBusinessId = userData.employeeOf;
        console.log("Found employer business ID:", employerBusinessId);
        
        // Update local storage with correct business context
        localStorage.setItem('currentBusinessId', employerBusinessId);
        
        return {
          ...user,
          businessId: employerBusinessId
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fixing business context:", error);
    return null;
  }
};