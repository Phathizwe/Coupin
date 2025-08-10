# IMMEDIATE COUPON FIX GUIDE

## Quick Fix Steps

### Step 1: Emergency Console Script
1. Open your browser and navigate to the "Manage Coupons" page
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Copy and paste the entire content of `emergency-coupon-fix.js` into the console
5. Press Enter to run the script
6. Wait for it to complete (you'll see "✅ Sync complete!" when done)
7. Refresh the coupons page

### Step 2: If Step 1 Doesn't Work
1. Look for the yellow "Debug Coupons" button on the coupons page
2. Click it and check the console output
3. If you don't see the button, the component updates may not have loaded

### Step 3: Manual Database Check
Run this in the browser console to check your specific business ID:

```javascript
// Replace 'YOUR_BUSINESS_ID' with your actual business ID from the console logs
const businessId = 'mem0JgfZC2QYiLMmwXPxbYbeeB3'; // Your business ID from the logs

// Check coupons collection
firebase.firestore().collection('coupons').where('businessId', '==', businessId).get()
  .then(snapshot => {
    console.log(`Main coupons collection: ${snapshot.size} documents`);
    snapshot.docs.forEach(doc => console.log('Coupon:', doc.id, doc.data()));
  });

// Check distributions
firebase.firestore().collection('couponDistributions').where('businessId', '==', businessId).get()
  .then(snapshot => {
    console.log(`Distributions collection: ${snapshot.size} documents`);
    snapshot.docs.forEach(doc => console.log('Distribution:', doc.id, doc.data()));
  });

// Check customer coupons
firebase.firestore().collection('customerCoupons').where('businessId', '==', businessId).get()
  .then(snapshot => {
    console.log(`Customer coupons collection: ${snapshot.size} documents`);
    snapshot.docs.forEach(doc => console.log('Customer coupon:', doc.id, doc.data()));
  });
```

## What the Fix Does

Based on your console logs, I can see:
- Your business ID: `mem0JgfZC2QYiLMmwXPxbYbeeB3`
- Your business profile is loading correctly
- The user authentication is working

The issue is likely that:
1. Coupons exist in `couponDistributions` or `customerCoupons` collections
2. But they don't exist in the main `coupons` collection
3. The UI only queries the main `coupons` collection

## Expected Results

After running the emergency script, you should see:
1. Console output showing which collections contain your coupon data
2. Automatic creation of missing coupon records in the main collection
3. Coupons appearing on the "Manage Coupons" page after refresh

## If It Still Doesn't Work

1. **Check the console logs** - Look for any error messages
2. **Verify business ID** - Make sure the business ID in the logs matches your expectation
3. **Check permissions** - Ensure your user has read/write access to the coupons collection
4. **Database rules** - Verify Firestore security rules allow the operations

## Troubleshooting Commands

```javascript
// Check current user
firebase.auth().currentUser

// Check user document
firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
  .then(doc => console.log('User doc:', doc.data()))

// Force refresh the coupons page component
window.location.reload()
```

## Contact Information

If the issue persists after trying these steps, please:
1. Share the complete console output from the emergency script
2. Let me know which collections showed data
3. Share any error messages that appeared