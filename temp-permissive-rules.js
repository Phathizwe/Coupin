// Temporary permissive Firestore rules for debugging
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// Create temporary permissive rules
const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

// Write to file
fs.writeFileSync('temp-firestore.rules', rules);
console.log('Created temporary permissive rules file');

// Deploy rules
console.log('To deploy these rules, run:');
console.log('firebase deploy --only firestore:rules --rules=temp-firestore.rules');
