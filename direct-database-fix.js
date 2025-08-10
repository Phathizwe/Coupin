// DIRECT DATABASE FIX - Run this in browser console NOW
// This bypasses the component and directly fixes your database

(async function directDatabaseFix() {
  console.log('🔧 DIRECT DATABASE FIX - Bypassing Component Issues');
  console.log('⏰ Starting at:', new Date().toISOString());

  try {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ No user logged in');
      return;
    }

    console.log('👤 User:', user.email);

    // Get business ID from user document
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const businessId = userData?.businessId || userData?.currentBusinessId;

    console.log('🏢 Business ID:', businessId);

    if (!businessId) {
      console.error('❌ No business ID found in user data:', userData);
      return;
    }

    console.log('🔍 Checking all coupon collections for business:', businessId);

    // Check all collections simultaneously
    const [couponsSnapshot, distributionsSnapshot, customerCouponsSnapshot] = await Promise.all([
      db.collection('coupons').where('businessId', '==', businessId).get(),
      db.collection('couponDistributions').where('businessId', '==', businessId).get(),
      db.collection('customerCoupons').where('businessId', '==', businessId).get()
    ]);

    console.log('📊 COLLECTION RESULTS:');
    console.log(`   📋 Main coupons: ${couponsSnapshot.size} documents`);
    console.log(`   📤 Distributions: ${distributionsSnapshot.size} documents`);
    console.log(`   👥 Customer coupons: ${customerCouponsSnapshot.size} documents`);

    // Log details of what we found
    if (distributionsSnapshot.size > 0) {
      console.log('📤 DISTRIBUTIONS FOUND:');
      distributionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.title || 'Untitled'} (${data.code || 'No code'})`);
      });
    }

    if (customerCouponsSnapshot.size > 0) {
      console.log('👥 CUSTOMER COUPONS FOUND:');
      customerCouponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.title || 'Untitled'} (${data.code || 'No code'}) - Customer: ${data.customerId}`);
      });
    }

    if (couponsSnapshot.size > 0) {
      console.log('📋 MAIN COUPONS FOUND:');
      couponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${doc.id}: ${data.title || 'Untitled'} (${data.code || 'No code'})`);
      });
    }

    // If main collection is empty but others have data, create missing coupons
    if (couponsSnapshot.size === 0 && (distributionsSnapshot.size > 0 || customerCouponsSnapshot.size > 0)) {
      console.log('🚨 PROBLEM IDENTIFIED: Coupons exist in other collections but not in main collection!');
      console.log('🔧 FIXING: Creating missing coupons in main collection...');

      const batch = db.batch();
      const processedIds = new Set();
      let createdCount = 0;

      // Process distributions first
      distributionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const couponId = data.couponId || doc.id;

        if (!processedIds.has(couponId)) {
          processedIds.add(couponId);
          const couponRef = db.collection('coupons').doc(couponId);

          const couponData = {
            businessId: businessId,
            title: data.title || 'Distributed Coupon',
            description: data.description || 'Coupon distributed to customers',
            type: data.type || 'percentage',
            value: data.value || 10,
            code: data.code || Math.random().toString(36).substring(2, 10).toUpperCase(),
            startDate: data.sentAt || firebase.firestore.Timestamp.now(),
            endDate: data.expiryDate || firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            active: data.active !== undefined ? data.active : true,
            usageLimit: data.usageLimit || 100,
            usageCount: 0,
            firstTimeOnly: data.firstTimeOnly || false,
            birthdayOnly: data.birthdayOnly || false,
            createdAt: data.sentAt || firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
          };

          batch.set(couponRef, couponData);
          createdCount++;
          console.log(`➕ Queued coupon creation: ${couponId} - "${couponData.title}"`);
        }
      });

      // Process customer coupons
      customerCouponsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const couponId = data.couponId || doc.id;

        if (!processedIds.has(couponId)) {
          processedIds.add(couponId);
          const couponRef = db.collection('coupons').doc(couponId);

          const couponData = {
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
            firstTimeOnly: data.firstTimeOnly || false,
            birthdayOnly: data.birthdayOnly || false,
            createdAt: data.allocatedDate || firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
          };

          batch.set(couponRef, couponData);
          createdCount++;
          console.log(`➕ Queued coupon creation: ${couponId} - "${couponData.title}"`);
        }
      });

      if (createdCount > 0) {
        console.log(`💾 Committing ${createdCount} coupon creations to database...`);
        await batch.commit();
        console.log('✅ SUCCESS! Coupons created in main collection!');

        // Verify the fix worked
        const verifySnapshot = await db.collection('coupons').where('businessId', '==', businessId).get();
        console.log(`🔍 VERIFICATION: Main collection now has ${verifySnapshot.size} coupons`);

        verifySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`   ✅ ${doc.id}: "${data.title}" (${data.code})`);
        });

        console.log('🔄 Reloading page to show coupons...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);

      } else {
        console.log('⚠️ No coupons to create - this is unexpected');
      }

    } else if (couponsSnapshot.size > 0) {
      console.log('✅ Coupons already exist in main collection - no fix needed');
      console.log('🔄 Reloading page to refresh component...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } else {
      console.log('ℹ️ No coupon data found in any collection');
      console.log('💡 This means no coupons have been created yet');
    }

  } catch (error) {
    console.error('❌ Error in direct database fix:', error);
    console.error('Stack trace:', error.stack);
  }
})();