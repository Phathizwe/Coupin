// Script to add custom claims to a user
const admin = require('firebase-admin');
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'nmmUO1gFIcZQV1LMkwKPxbYbes83'; // The UID from your screenshots

// Add custom claims
admin.auth().setCustomUserClaims(uid, {
  role: 'business',
  businessId: uid
})
.then(() => {
  console.log('Custom claims added successfully');
  
  // Get the user to verify
  return admin.auth().getUser(uid);
})
.then((userRecord) => {
  console.log('User:', userRecord.toJSON());
  console.log('Custom claims:', userRecord.customClaims);
  
  // Now update the Firestore document to ensure it matches
  const db = admin.firestore();
  return db.collection('users').doc(uid).update({
    role: 'business',
    businessId: uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
})
.then(() => {
  console.log('User document updated successfully');
  process.exit(0);
})
.catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});