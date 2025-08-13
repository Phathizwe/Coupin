const { execSync } = require('child_process');
const fs = require('fs');

// Create a specific index for loyalty members
const loyaltyMembersIndex = {
  "indexes": [
    {
      "collectionGroup": "customerPrograms",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "businessId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "programId",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "loyaltyMembers",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "businessId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "programId",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

// Write the index to a temporary file
fs.writeFileSync('loyalty-members-index.json', JSON.stringify(loyaltyMembersIndex, null, 2));

console.log('Deploying specific index for loyalty members...');
try {
  execSync('firebase deploy --only firestore:indexes --config=loyalty-members-index.json', { stdio: 'inherit' });
  console.log('✅ Loyalty members index deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying loyalty members index:', error.message);
}

// Clean up
fs.unlinkSync('loyalty-members-index.json');