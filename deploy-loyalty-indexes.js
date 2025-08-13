const { execSync } = require('child_process');

console.log('Deploying Firestore security rules...');
try {
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Firestore rules deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying Firestore rules:', error.message);
  process.exit(1);
}

console.log('\nDeploying Firestore indexes...');
try {
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  console.log('✅ Firestore indexes deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying Firestore indexes:', error.message);
  process.exit(1);
}

console.log('\n✅ All Firestore configurations deployed successfully!');
console.log('The loyalty program should now work correctly with proper permissions.');