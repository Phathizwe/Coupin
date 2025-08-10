// Script to create proper security rules that will work with your user structure
const fs = require('fs');
const { execSync } = require('child_process');

// Create proper rules that will work with your user structure
const properRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user is accessing their own data
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user is accessing data for their business
    function isBusinessUser(businessId) {
      return isAuthenticated() && (
        request.auth.uid == businessId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.currentBusinessId == businessId
      );
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if isAuthenticated();
    }
    
    // All other collections
    match /{collection}/{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}`;

// Write the rules to a file
fs.writeFileSync('fixed-firestore.rules', properRules);

// Deploy the rules
try {
  console.log('Deploying fixed security rules...');
  execSync('firebase deploy --only firestore:rules -f --project=coupin-f35d2', { stdio: 'inherit' });
  console.log('Fixed rules deployed successfully.');
} catch (error) {
  console.error('Failed to deploy rules:', error);
}