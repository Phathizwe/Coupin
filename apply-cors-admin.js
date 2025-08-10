/**
 * Script to apply CORS settings to Firebase Storage using Firebase Admin SDK
 * Run with: node apply-cors-admin.js
 */
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin with service account
try {
  // Try to find service account file
  const serviceAccountFiles = [
    'coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json',
    'serviceAccount.json'
  ];
  
  let serviceAccount;
  for (const file of serviceAccountFiles) {
    if (fs.existsSync(file)) {
      serviceAccount = require(`./${file}`);
      console.log(`Using service account from ${file}`);
      break;
    }
  }
  
  if (!serviceAccount) {
    console.error('Error: No service account file found.');
    console.error('Please download your Firebase service account key and save it as serviceAccount.json');
    console.error('Instructions: https://firebase.google.com/docs/admin/setup#initialize-sdk');
    process.exit(1);
  }
  
  // Initialize the app
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
  
  // Read CORS configuration
  const corsConfig = JSON.parse(fs.readFileSync('cors.json', 'utf8'));
  console.log('CORS configuration:', JSON.stringify(corsConfig, null, 2));
  
  // Get bucket and update CORS settings
  const bucket = admin.storage().bucket();
  
  console.log(`Applying CORS settings to bucket: ${bucket.name}`);
  
  bucket.setCorsConfiguration(corsConfig)
    .then(() => {
      console.log('CORS settings successfully applied to Firebase Storage!');
      console.log('You should now be able to upload files from your application.');
      process.exit(0);
    })
    .catch(error => {
      console.error(`Error applying CORS settings: ${error.message}`);
      process.exit(1);
    });
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}