// This script previously added sample customers to your Firestore database
// It has been disabled to ensure all data comes from real user input through the application

async function addSampleCustomers() {
  console.warn('Sample data functionality has been removed. All data must come from Firebase Firestore.');
  return {
    success: false,
    error: 'Sample data functionality has been disabled. All data must come from Firebase Firestore.'
  };
}

// Display warning if someone tries to run this script
console.warn('⚠️ WARNING: Sample data functionality has been disabled.');
console.warn('All customer data must be added through the application interface and stored in Firebase Firestore.');