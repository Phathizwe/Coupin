/**
 * Script to apply CORS settings to Firebase Storage
 * Run with: node apply-cors.js
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Applying CORS settings to Firebase Storage...');

// Read project ID from .firebaserc
try {
  const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
  const projectId = firebaserc.projects.default;
  
  if (!projectId) {
    console.error('Error: Could not find project ID in .firebaserc');
    process.exit(1);
  }
  
  console.log(`Using Firebase project: ${projectId}`);
  
  // Apply CORS settings
  exec(`gsutil cors set cors.json gs://${projectId}.appspot.com`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error applying CORS settings: ${error.message}`);
      console.error('If gsutil is not found, please install Google Cloud SDK and authenticate.');
      console.error('Alternative: Use Firebase CLI with: firebase storage:cors update cors.json');
      process.exit(1);
    }
    
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    
    console.log('CORS settings successfully applied to Firebase Storage!');
    console.log('You should now be able to upload files from your application.');
  });
  
} catch (error) {
  console.error(`Error reading .firebaserc: ${error.message}`);
  process.exit(1);
}