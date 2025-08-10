// src/scripts/deployOptimizedIndexes.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to deploy optimized Firestore indexes
 */
function deployOptimizedIndexes() {
  try {
    console.log('Backing up current indexes...');
    // Backup current indexes if they exist
    if (fs.existsSync('firestore.indexes.json')) {
      fs.copyFileSync(
        'firestore.indexes.json', 
        `firestore.indexes.backup-${Date.now()}.json`
      );
    }
    
    console.log('Applying optimized indexes...');
    // Copy optimized indexes to the standard filename
    fs.copyFileSync(
      'firestore.indexes.optimized.json',
      'firestore.indexes.json'
    );
    
    console.log('Deploying indexes to Firebase...');
    // Deploy indexes to Firebase
    execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
    
    console.log('✅ Optimized indexes deployed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to deploy optimized indexes:', error);
    return false;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  const success = deployOptimizedIndexes();
  process.exit(success ? 0 : 1);
}

module.exports = { deployOptimizedIndexes };