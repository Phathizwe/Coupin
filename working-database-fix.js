// WORKING DATABASE FIX - This uses the Firebase instance that's already loaded
// Copy and paste this entire script into your browser console

(async function workingDatabaseFix() {
  console.log('🔧 WORKING DATABASE FIX STARTING...');

  try {
    // Try different ways to access Firebase
    let db, auth;

    if (window.firebase) {
      db = window.firebase.firestore();
      auth = window.firebase.auth();
    } else if (window.getFirestore) {
      // Try Firebase v9+ modular SDK
      db = window.getFirestore();
      auth = window.getAuth();
    } else {
      console.error('❌ Firebase not found. Available objects:', Object.keys(window));
      return;
    }

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

    // Check customer coupons (where your 2 coupons are)
    console.log('🔍 Checking customer coupons...');
    const customerCoupons = await db.collection('customerCoupons').where('businessId', '==', businessId).get();
    console.log('👥 Found', customerCoupons.size, 'customer coupons');

    // Check main coupons collection
    console.log('🔍 Checking main coupons...');
    const mainCoupons = await db.collection('coupons').where('businessId', '==', businessId).get();
    console.log('📋 Found', mainCoupons.size, 'main coupons');

    // Log details of customer coupons
    if (customerCoupons.size > 0) {
      console.log('📄 Customer coupon details:');
      customerCoupons.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.title || 'Untitled'} (Customer: ${data.customerId})`);
      });
    }

    if (customerCoupons.size > 0 && mainCoupons.size === 0) {
      console.log('🔧 Creating missing coupons in main collection...');

      const batch = db.batch();
      let createdCount = 0;

      customerCoupons.docs.forEach(doc => {
        const data = doc.data();
        const couponId = data.couponId || doc.id;

        const couponRef = db.collection('coupons').doc(couponId);
        const couponData = {
          businessId: businessId,
          title: data.title || 'Customer Coupon',
          description: data.description || 'Coupon for customer',
          type: data.type || 'percentage',
          value: data.value || 10,
          code: data.code || 'COUPON' + Math.floor(Math.random() * 1000),
          startDate: data.allocatedDate || (window.firebase ? window.firebase.firestore.Timestamp.now() : new Date()),
          endDate: data.expiryDate || (window.firebase ? window.firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          active: data.active !== undefined ? data.active : true,
          usageLimit: data.usageLimit || 1,
          usageCount: data.used ? 1 : 0,
          firstTimeOnly: data.firstTimeOnly || false,
          birthdayOnly: data.birthdayOnly || false,
          createdAt: data.allocatedDate || (window.firebase ? window.firebase.firestore.Timestamp.now() : new Date()),
          updatedAt: window.firebase ? window.firebase.firestore.Timestamp.now() : new Date()
        };

        batch.set(couponRef, couponData);
        createdCount++;
        console.log(`➕ Queued coupon: ${couponId} - "${couponData.title}"`);
      });

      if (createdCount > 0) {
        console.log(`💾 Committing ${createdCount} coupons...`);
        await batch.commit();
        console.log('✅ SUCCESS! Coupons created in main collection!');

        // Verify the fix
        const verifySnapshot = await db.collection('coupons').where('businessId', '==', businessId).get();
        console.log(`🔍 VERIFICATION: Main collection now has ${verifySnapshot.size} coupons`);

        verifySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`   ✅ ${doc.id}: "${data.title}" (${data.code})`);
        });

        console.log('🔄 Reloading page in 3 seconds...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } else if (mainCoupons.size > 0) {
      console.log('✅ Coupons already exist in main collection');
      console.log('🔄 Reloading page to refresh...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log('ℹ️ No customer coupons found to migrate');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
})();