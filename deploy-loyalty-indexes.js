const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Deploying optimized Firestore indexes for loyalty program...');

try {
  // Ensure we're using the latest indexes file
  console.log('Using indexes from firestore.indexes.json');
  
  // Deploy the indexes
  console.log('Deploying indexes to Firebase...');
  const output = execSync('firebase deploy --only firestore:indexes', { encoding: 'utf8' });
  
  console.log('Deployment output:');
  console.log(output);
  
  console.log('Indexes deployed successfully!');
} catch (error) {
  console.error('Error deploying indexes:', error.message);
  process.exit(1);
}