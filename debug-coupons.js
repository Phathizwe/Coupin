// Copy and paste this entire script into your browser console when on the Coupons page

(async function debugCoupons() {
  try {
    console.log('======= COUPON DEBUGGING SCRIPT =======');
    
    // Get the current user's businessId
    const auth = firebase.auth();
    const db = firebase.firestore();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No user is logged in. Please log in first.');
      return;
    }
    
    console.log('Current User:', currentUser.email);
    
    // Get the user's businessId from Firestore
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    const businessId = userData?.businessId;
    
    console.log('Business ID:', businessId);
    
    if (!businessId) {
      console.error('No businessId found for current user. Make sure your user account is properly set up.');
      return;
    }
    
    // 1. Query ALL coupons without any filters
    console.log('Fetching ALL coupons in the database...');
    const allCouponsSnapshot = await db.collection('coupons').get();
    const allCoupons = allCouponsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${allCoupons.length} total coupons in the database:`, allCoupons);
    
    // 2. Query coupons for this specific business
    console.log(`Fetching coupons for business ID: ${businessId}...`);
    const businessCouponsSnapshot = await db.collection('coupons')
      .where('businessId', '==', businessId)
      .get();
    
    const businessCoupons = businessCouponsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${businessCoupons.length} coupons for this business:`, businessCoupons);
    
    // 3. Check if coupons have required fields
    console.log('Checking required fields for each coupon...');
    businessCoupons.forEach(coupon => {
      console.log(`Coupon ID: ${coupon.id}, Code: ${coupon.code}`);
      
      // Check required fields
      const missingFields = [];
      if (!coupon.title) missingFields.push('title');
      if (!coupon.code) missingFields.push('code');
      if (!coupon.description) missingFields.push('description');
      
      if (missingFields.length > 0) {
        console.warn(`⚠️ Coupon is missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Coupon has all required fields');
      }
      
      // Check dates
      const now = new Date();
      const startDate = coupon.startDate?.toDate ? coupon.startDate.toDate() : new Date(coupon.startDate);
      const endDate = coupon.endDate?.toDate ? coupon.endDate.toDate() : new Date(coupon.endDate);
      
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);
      console.log('Current Date:', now);
      
      // Determine status
      let status = 'Unknown';
      if (!coupon.active) {
        status = 'Inactive';
      } else if (startDate > now) {
        status = 'Scheduled';
      } else if (endDate < now) {
        status = 'Expired';
      } else {
        status = 'Active';
      }
      
      console.log(`Coupon Status: ${status}`);
      console.log('-------------------');
    });
    
    // 4. Check for any console errors
    console.log('Checking for any errors in the console...');
    if (console.error.toString().includes('native code')) {
      console.log('✅ No custom error handler detected. Original console.error is intact.');
    } else {
      console.warn('⚠️ Console.error may have been overridden. Check for suppressed errors.');
    }
    
    console.log('======= END OF DEBUGGING SCRIPT =======');
    
    return {
      totalCoupons: allCoupons.length,
      businessCoupons: businessCoupons.length,
      coupons: businessCoupons
    };
  } catch (error) {
    console.error('Error in debugging script:', error);
  }
})();