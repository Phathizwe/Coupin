const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create an updated firestore.indexes.json file with all required indexes
const updatedIndexes = {
  "indexes": [
    // Existing indexes
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
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "customerCoupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "allocatedDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "customerCoupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "allocatedDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "customerCoupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "allocatedDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "couponDistribution",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "couponId", "order": "ASCENDING" },
        { "fieldPath": "distributedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "couponDistribution",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "couponId", "order": "ASCENDING" },
        { "fieldPath": "distributedAt", "order": "DESCENDING" }
      ]
    },
    
    // Loyalty program indexes
    {
      "collectionGroup": "loyaltyPrograms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyPrograms",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    },
    
    // Loyalty achievements indexes
    {
      "collectionGroup": "loyaltyAchievements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "programId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyAchievements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "completed", "order": "ASCENDING" }
      ]
    },
    
    // Customer stats indexes
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "loyaltyPoints", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "totalSpent", "order": "DESCENDING" }
      ]
    },
    
    // Loyalty points indexes
    {
      "collectionGroup": "loyaltyPoints",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "programId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyPoints",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "programId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "loyaltyPoints",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "customerId", "order": "ASCENDING" }
      ]
    },
    
    // Redemption tracking indexes
    {
      "collectionGroup": "redemptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "businessId", "order": "ASCENDING" },
        { "fieldPath": "programId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "customers",
      "fieldPath": "phone_normalized",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" }
      ]
    },
    {
      "collectionGroup": "customers", 
      "fieldPath": "businessId",
      "indexes": [
        { "order": "ASCENDING", "queryScope": "COLLECTION" }
      ]
    }
  ]
};

// Write the updated indexes to a file
fs.writeFileSync('firestore.indexes.json', JSON.stringify(updatedIndexes, null, 2));

console.log('Deploying all required Firestore indexes for loyalty program stats...');

try {
  // Deploy the indexes
  console.log('Running firebase deploy --only firestore:indexes');
  const output = execSync('firebase deploy --only firestore:indexes', { encoding: 'utf8' });
  
  console.log('Deployment output:');
  console.log(output);
  
  console.log('Indexes deployed successfully!');
} catch (error) {
  console.error('Error deploying indexes:', error.message);
  process.exit(1);
}