// IMMEDIATE FIX - Run this in browser console
// This will force fetch and display coupons regardless of component state

(async function forceCouponFix() {
  console.log('🔧 FORCING COUPON FIX...');
  console.log('📅 Start time:', new Date().toISOString());

  const DEBUG = true;

  function debugLog(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  try {
    // Get Firebase instances
    const auth = firebase.auth();
    const db = firebase.firestore();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    console.log('✅ User found:', user.email);

    // Get business ID from user document
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const businessId = userData?.businessId || userData?.currentBusinessId;

    console.log('🏢 Business ID:', businessId);

    if (!businessId) {
      console.error('❌ No business ID found');
      return;
    }

    // Check all collections and fix data
    console.log('🔍 Checking all coupon collections...');

    // 1. Check main coupons collection
    const couponsQuery = db.collection('coupons').where('businessId', '==', businessId);
    const couponsSnapshot = await couponsQuery.get();
    console.log(`📋 Main coupons collection: ${couponsSnapshot.size} documents`);

    // 2. Check distributions
    const distributionsQuery = db.collection('couponDistributions').where('businessId', '==', businessId);
    const distributionsSnapshot = await distributionsQuery.get();
    console.log(`📤 Distributions collection: ${distributionsSnapshot.size} documents`);

    // 3. Check customer coupons
    const customerCouponsQuery = db.collection('customerCoupons').where('businessId', '==', businessId);
    const customerCouponsSnapshot = await customerCouponsQuery.get();
    console.log(`👥 Customer coupons collection: ${customerCouponsSnapshot.size} documents`);

    // If main collection is empty but others have data, create missing coupons
    if (couponsSnapshot.size === 0 && (distributionsSnapshot.size > 0 || customerCouponsSnapshot.size > 0)) {
      console.log('🔄 Creating missing coupons from other collections...');

      const batch = db.batch();
      let createdCount = 0;

      // Process distributions
      distributionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId) {
          const couponRef = db.collection('coupons').doc(data.couponId);
          const couponData = {
            businessId: businessId,
            title: data.title || `Distributed Coupon`,
            description: data.description || 'Coupon distributed to customers',
            type: data.type || 'percentage',
            value: data.value || 10,
            code: data.code || Math.random().toString(36).substring(2, 10).toUpperCase(),
            startDate: data.sentAt || firebase.firestore.Timestamp.now(),
            endDate: data.expiryDate || firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            active: data.active !== undefined ? data.active : true,
            usageLimit: data.usageLimit || 1,
            usageCount: data.redeemedAt ? 1 : 0,
            firstTimeOnly: false,
            birthdayOnly: false,
            createdAt: data.sentAt || firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
          };
          batch.set(couponRef, couponData);
          createdCount++;
          console.log(`➕ Queued coupon creation: ${data.couponId}`);
        }
      });

      // Process customer coupons
      customerCouponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId) {
          const couponRef = db.collection('coupons').doc(data.couponId);
          const couponData = {
            businessId: businessId,
            title: data.title || `Customer Coupon`,
            description: data.description || 'Coupon allocated to customer',
            type: data.type || 'percentage',
            value: data.value || 10,
            code: data.code || Math.random().toString(36).substring(2, 10).toUpperCase(),
            startDate: data.allocatedDate || firebase.firestore.Timestamp.now(),
            endDate: data.expiryDate || firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            active: data.active !== undefined ? data.active : true,
            usageLimit: data.usageLimit || 1,
            usageCount: data.used ? 1 : 0,
            firstTimeOnly: false,
            birthdayOnly: false,
            createdAt: data.allocatedDate || firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
          };
          batch.set(couponRef, couponData);
          createdCount++;
          console.log(`➕ Queued coupon creation: ${data.couponId}`);
        }
      });

      if (createdCount > 0) {
        console.log(`💾 Committing ${createdCount} coupon creations...`);
        await batch.commit();
        console.log('✅ Batch commit successful!');

        // Force reload the page to refresh the component
        console.log('🔄 Reloading page to refresh coupons...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.log('⚠️ No coupons to create');
      }
    } else if (couponsSnapshot.size > 0) {
      console.log('✅ Coupons already exist in main collection');
      couponsSnapshot.docs.forEach(doc => {
        console.log('📄 Coupon:', doc.id, doc.data());
      });

      // Force reload to refresh component
      console.log('🔄 Reloading page to refresh component...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      console.log('ℹ️ No coupon data found in any collection');
    }

  } catch (error) {
    console.error('❌ Error in force fix:', error);
  }
})();