/**
 * Simple script to fix CORS settings for Firebase Storage
 */
const admin = require('firebase-admin');
const serviceAccount = require('./coupin-f35d2-firebase-adminsdk-fbsvc-a9ac6a524a.json');

// CORS configuration - explicitly include your local and network URLs
const corsConfig = [
  {
    origin: [
      "http://localhost:3000",
      "http://192.168.0.136:3000", // Your network URL from the terminal
      "https://coupin-f35d2.web.app",
      "https://coupin-f35d2.firebaseapp.com"
    ],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    responseHeader: [
      "Content-Type", 
      "Content-Length", 
      "Content-Disposition", 
      "Accept", 
      "Authorization", 
      "Origin", 
      "X-Requested-With"
    ],
    maxAgeSeconds: 3600
  }
];

// Initialize Firebase Admin with the exact project ID and bucket name
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "coupin-f35d2.appspot.com" // Explicitly set the bucket name
});

console.log('Applying CORS settings to Firebase Storage bucket: coupin-f35d2.appspot.com');
console.log('CORS configuration:', JSON.stringify(corsConfig, null, 2));

// Get the default bucket
const bucket = admin.storage().bucket();

// Apply CORS settings
bucket.setCorsConfiguration(corsConfig)
  .then(() => {
    console.log('✅ CORS settings successfully applied!');
    console.log('You should now be able to upload files from your application.');
  })
  .catch(error => {
    console.error(`❌ Error applying CORS settings: ${error.message}`);
    
    // Additional debugging information
    if (error.code === 403) {
      console.error('This might be a permissions issue with your service account.');
      console.error('Make sure your service account has the Storage Admin role.');
    }
  });