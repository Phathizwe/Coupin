// Emergency coupon debug script
// Copy and paste this into your browser console when on the coupons page

(async function emergencyCouponDebug() {
  console.log('======= EMERGENCY COUPON DEBUG =======');

  try {
    // Try to get Firebase instances
    const auth = window.firebase?.auth?.() || window.getAuth?.();
    const db = window.firebase?.firestore?.() || window.getFirestore?.();

    if (!auth || !db) {
      console.error('Firebase not available. Trying alternative approach...');

      // Try to access React context directly
      const reactFiberNode = document.querySelector('[data-reactroot]')?._reactInternalFiber ||
        document.querySelector('#root')?._reactInternalFiber;

      if (reactFiberNode) {
        console.log('Found React fiber node, attempting to access context...');
      }

      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    console.log('Current user:', currentUser.email, currentUser.uid);

    // Get user document
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    console.log('User data:', userData);

    const businessId = userData?.businessId || userData?.currentBusinessId;
    console.log('Business ID:', businessId);

    if (!businessId) {
      console.error('No business ID found');
      return;
    }

    // Check all collections
    console.log('=== CHECKING COUPONS COLLECTION ===');
    const couponsSnapshot = await db.collection('coupons')
      .where('businessId', '==', businessId)
      .get();

    console.log(`Found ${couponsSnapshot.size} coupons in main collection`);
    couponsSnapshot.docs.forEach(doc => {
      console.log('Coupon:', doc.id, doc.data());
    });

    console.log('=== CHECKING COUPON DISTRIBUTIONS ===');
    const distributionsSnapshot = await db.collection('couponDistributions')
      .where('businessId', '==', businessId)
      .get();

    console.log(`Found ${distributionsSnapshot.size} distributions`);
    distributionsSnapshot.docs.forEach(doc => {
      console.log('Distribution:', doc.id, doc.data());
    });

    console.log('=== CHECKING CUSTOMER COUPONS ===');
    const customerCouponsSnapshot = await db.collection('customerCoupons')
      .where('businessId', '==', businessId)
      .get();

    console.log(`Found ${customerCouponsSnapshot.size} customer coupons`);
    customerCouponsSnapshot.docs.forEach(doc => {
      console.log('Customer coupon:', doc.id, doc.data());
    });

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total coupons in main collection: ${couponsSnapshot.size}`);
    console.log(`Total distributions: ${distributionsSnapshot.size}`);
    console.log(`Total customer coupons: ${customerCouponsSnapshot.size}`);

    if (couponsSnapshot.size === 0 && (distributionsSnapshot.size > 0 || customerCouponsSnapshot.size > 0)) {
      console.log('⚠️ ISSUE IDENTIFIED: Coupons exist in other collections but not in main collection');
      console.log('This explains why the coupons page shows no results');

      // Try to create missing coupons
      console.log('Attempting to create missing coupon records...');

      // Process distributions
      for (const distDoc of distributionsSnapshot.docs) {
        const distData = distDoc.data();
        if (distData.couponId) {
          try {
            const existingCoupon = await db.collection('coupons').doc(distData.couponId).get();
            if (!existingCoupon.exists()) {
              console.log(`Creating coupon from distribution: ${distData.couponId}`);

              const couponData = {
                businessId: businessId,
                title: distData.title || `Coupon ${distData.couponId.substring(0, 8)}`,
                description: distData.description || 'Distributed coupon',
                type: distData.type || 'percentage',
                value: distData.value || 10,
                code: distData.code || distData.couponId.substring(0, 8).toUpperCase(),
                startDate: distData.sentAt || new Date(),
                endDate: distData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                active: distData.active !== undefined ? distData.active : true,
                usageLimit: distData.usageLimit || 1,
                usageCount: distData.redeemedAt ? 1 : 0,
                firstTimeOnly: false,
                birthdayOnly: false,
                createdAt: distData.sentAt || new Date(),
                updatedAt: new Date()
              };

              await db.collection('coupons').doc(distData.couponId).set(couponData);
              console.log(`✅ Created coupon: ${distData.couponId}`);
            }
          } catch (err) {
            console.error(`Error processing distribution ${distDoc.id}:`, err);
          }
        }
      }

      // Process customer coupons
      for (const custDoc of customerCouponsSnapshot.docs) {
        const custData = custDoc.data();
        if (custData.couponId) {
          try {
            const existingCoupon = await db.collection('coupons').doc(custData.couponId).get();
            if (!existingCoupon.exists()) {
              console.log(`Creating coupon from customer coupon: ${custData.couponId}`);

              const couponData = {
                businessId: businessId,
                title: custData.title || `Coupon ${custData.couponId.substring(0, 8)}`,
                description: custData.description || 'Customer coupon',
                type: custData.type || 'percentage',
                value: custData.value || 10,
                code: custData.code || custData.couponId.substring(0, 8).toUpperCase(),
                startDate: custData.allocatedDate || new Date(),
                endDate: custData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                active: custData.active !== undefined ? custData.active : true,
                usageLimit: custData.usageLimit || 1,
                usageCount: custData.used ? 1 : 0,
                firstTimeOnly: false,
                birthdayOnly: false,
                createdAt: custData.allocatedDate || new Date(),
                updatedAt: new Date()
              };

              await db.collection('coupons').doc(custData.couponId).set(couponData);
              console.log(`✅ Created coupon: ${custData.couponId}`);
            }
          } catch (err) {
            console.error(`Error processing customer coupon ${custDoc.id}:`, err);
          }
        }
      }

      console.log('✅ Sync complete! Please refresh the coupons page.');
    }

  } catch (error) {
    console.error('Error in emergency debug:', error);
  }

  console.log('======= END EMERGENCY DEBUG =======');
})();