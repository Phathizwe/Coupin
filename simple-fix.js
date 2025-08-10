// SIMPLE DATABASE FIX - Copy and paste this entire script into your browser console

(async function simpleDatabaseFix() {
  console.log('🔧 SIMPLE DATABASE FIX STARTING...');

  const db = firebase.firestore();
  const user = firebase.auth().currentUser;

  // Get business ID
  const userDoc = await db.collection('users').doc(user.uid).get();
  const businessId = userDoc.data().businessId;

  console.log('🏢 Business ID:', businessId);

  // Check customer coupons (where your 2 coupons are)
  const customerCoupons = await db.collection('customerCoupons').where('businessId', '==', businessId).get();
  console.log('👥 Found', customerCoupons.size, 'customer coupons');

  // Check main coupons collection
  const mainCoupons = await db.collection('coupons').where('businessId', '==', businessId).get();
  console.log('📋 Found', mainCoupons.size, 'main coupons');

  if (customerCoupons.size > 0 && mainCoupons.size === 0) {
    console.log('🔧 Creating missing coupons...');

    const batch = db.batch();

    customerCoupons.docs.forEach(doc => {
      const data = doc.data();
      const couponId = data.couponId || doc.id;

      const couponRef = db.collection('coupons').doc(couponId);
      batch.set(couponRef, {
        businessId: businessId,
        title: data.title || 'Customer Coupon',
        description: data.description || 'Coupon for customer',
        type: 'percentage',
        value: data.value || 10,
        code: data.code || 'COUPON' + Math.floor(Math.random() * 1000),
        startDate: firebase.firestore.Timestamp.now(),
        endDate: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        active: true,
        usageLimit: 1,
        usageCount: 0,
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now()
      });

      console.log('➕ Creating coupon:', couponId);
    });

    await batch.commit();
    console.log('✅ SUCCESS! Coupons created!');

    // Reload page
    setTimeout(() => window.location.reload(), 2000);
  } else {
    console.log('ℹ️ No fix needed or already fixed');
  }
})();