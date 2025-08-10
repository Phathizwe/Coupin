// Script to deploy Firebase indexes
const fs = require('fs');
const { execSync } = require('child_process');

// Create the updated indexes file
const indexes = {
  "indexes": [
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "lastName", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyPrograms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "expiryDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "redemptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "redeemedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "redemptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "couponId", "order": "ASCENDING" },
        { "fieldPath": "redeemedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyRewards",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "pointsCost", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
};

// Write the updated indexes to the file
fs.writeFileSync('firestore.indexes.json', JSON.stringify(indexes, null, 2));

// Update the security rules
const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Common function to check if user is the business owner
    function isBusinessOwner(businessId) {
      return isAuthenticated() && request.auth.uid == businessId;
    }
    
    // Authentication rules
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Business profiles
    match /businesses/{businessId} {
      allow read: if true; // Public business profiles are readable by anyone
      allow create, update, delete: if isBusinessOwner(businessId);
    }
    
    // Customers collection (top-level)
    match /customers/{customerId} {
      allow read, write: if isAuthenticated() && 
        (request.auth.uid == resource.data.businessId || 
         request.auth.uid == customerId);
    }
    
    // Coupons collection (top-level)
    match /coupons/{couponId} {
      allow read: if true; // Public coupons are readable
      allow create, update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Loyalty programs (top-level)
    match /loyaltyPrograms/{programId} {
      allow read: if true; // Public loyalty programs are readable
      allow create, update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Loyalty rewards (top-level)
    match /loyaltyRewards/{rewardId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }
    
    // Redemptions (top-level)
    match /redemptions/{redemptionId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.businessId || 
         request.auth.uid == resource.data.customerId);
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Customer coupon collection (top-level)
    match /customerCoupons/{couponId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.businessId || 
         request.auth.uid == resource.data.customerId);
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Message templates
    match /messageTemplates/{templateId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Communication campaigns
    match /campaigns/{campaignId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
    
    // Communication channels
    match /communicationChannels/{channelId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.businessId;
    }
  }
}`;

// Write the updated rules to the file
fs.writeFileSync('firestore.rules', rules);

console.log('Updated Firestore indexes and rules files');
console.log('Deploying to Firebase...');

try {
  // Deploy the updated indexes and rules to Firebase
  execSync('firebase deploy --only firestore:indexes,firestore:rules', { stdio: 'inherit' });
  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error);
}