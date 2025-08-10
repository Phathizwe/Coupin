// FINAL COUPON FIX - Run this after the new deployment
// This script will work with the updated component

(async function finalCouponFix() {
  console.log('🚀 FINAL COUPON FIX - Updated Component Version');
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    // First, let's verify the component is now loading
    console.log('🔍 Checking if updated component is loaded...');

    // Look for the debug button (should exist now)
    const debugButton = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.textContent && btn.textContent.includes('Debug Coupons')
    );

    if (debugButton) {
      console.log('✅ Updated component detected! Debug button found.');
      console.log('🔘 Clicking debug button automatically...');
      debugButton.click();
      return; // Let the component's debug function handle it
    } else {
      console.log('⚠️ Debug button not found, running manual fix...');
    }

    // Manual fix if component still not updated
    const auth = firebase.auth();
    const db = firebase.firestore();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    console.log('👤 User:', user.email);

    // Get business ID
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const businessId = userData?.businessId || userData?.currentBusinessId;

    console.log('🏢 Business ID:', businessId);

    if (!businessId) {
      console.error('❌ No business ID found');
      return;
    }

    // Check and fix coupon data
    console.log('🔍 Checking coupon collections...');

    const [couponsSnapshot, distributionsSnapshot, customerCouponsSnapshot] = await Promise.all([
      db.collection('coupons').where('businessId', '==', businessId).get(),
      db.collection('couponDistributions').where('businessId', '==', businessId).get(),
      db.collection('customerCoupons').where('businessId', '==', businessId).get()
    ]);

    console.log(`📊 Results:`);
    console.log(`   Main coupons: ${couponsSnapshot.size}`);
    console.log(`   Distributions: ${distributionsSnapshot.size}`);
    console.log(`   Customer coupons: ${customerCouponsSnapshot.size}`);

    if (couponsSnapshot.size === 0 && (distributionsSnapshot.size > 0 || customerCouponsSnapshot.size > 0)) {
      console.log('🔧 Creating missing coupons...');

      const batch = db.batch();
      const processedIds = new Set();

      // Process distributions
      distributionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId && !processedIds.has(data.couponId)) {
          processedIds.add(data.couponId);
          const couponRef = db.collection('coupons').doc(data.couponId);
          batch.set(couponRef, {
            businessId: businessId,
            title: data.title || 'Distributed Coupon',
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
          });
          console.log(`➕ Queued: ${data.couponId}`);
        }
      });

      // Process customer coupons
      customerCouponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.couponId && !processedIds.has(data.couponId)) {
          processedIds.add(data.couponId);
          const couponRef = db.collection('coupons').doc(data.couponId);
          batch.set(couponRef, {
            businessId: businessId,
            title: data.title || 'Customer Coupon',
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
          });
          console.log(`➕ Queued: ${data.couponId}`);
        }
      });

      if (processedIds.size > 0) {
        console.log(`💾 Committing ${processedIds.size} coupons...`);
        await batch.commit();
        console.log('✅ Coupons created successfully!');

        // Force reload
        console.log('🔄 Reloading page...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        console.log('ℹ️ No coupons to create');
      }
    } else if (couponsSnapshot.size > 0) {
      console.log('✅ Coupons already exist!');
      couponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`📄 ${doc.id}: ${data.title} (${data.code})`);
      });

      // Reload to refresh component
      console.log('🔄 Reloading to refresh component...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log('ℹ️ No coupon data found anywhere');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
})();