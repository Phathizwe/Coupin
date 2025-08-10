/**
 * This script seeds the qrCodeScans collection with sample data.
 * Run it with: node seedQRCodeAnalytics.js [businessId]
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp,
  query,
  where,
  getDocs
} = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate a random date within the last 30 days
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  now.setMinutes(now.getMinutes() - minutesAgo);
  
  return Timestamp.fromDate(now);
}

// Generate random user agent
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/96.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Generate random device info
function getRandomDeviceInfo() {
  const userAgent = getRandomUserAgent();
  const isMobile = userAgent.includes('Mobile');
  const platform = isMobile 
    ? (userAgent.includes('iPhone') ? 'iOS' : 'Android')
    : (userAgent.includes('Windows') ? 'Windows' : 'macOS');
  
  return {
    userAgent,
    platform,
    mobile: isMobile
  };
}

// Generate a random scan event
function generateRandomScanEvent(businessId, couponIds, customerIds) {
  // Randomly decide if this is a business-wide scan or for a specific coupon
  const isCouponSpecific = Math.random() > 0.3;
  
  // Randomly select a coupon if this is a coupon-specific scan
  const couponId = isCouponSpecific 
    ? couponIds[Math.floor(Math.random() * couponIds.length)]
    : null;
  
  // Randomly decide if this is an anonymous scan or from a known customer
  const isAnonymous = Math.random() > 0.7;
  
  // Randomly select a customer if this is not anonymous
  const customerId = !isAnonymous 
    ? customerIds[Math.floor(Math.random() * customerIds.length)]
    : null;
  
  // Randomly decide if this scan led to a conversion
  const converted = Math.random() > 0.6;
  
  return {
    businessId,
    couponId,
    customerId,
    scannedAt: getRandomRecentDate(),
    converted,
    deviceInfo: getRandomDeviceInfo()
  };
}

// Main function to seed the database
async function seedQRCodeScans(businessId, numScans = 50) {
  try {
    console.log(`Seeding QR code scans for business: ${businessId}`);
    
    // First, get some coupon IDs for this business
    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(couponsRef, where('businessId', '==', businessId));
    const couponsSnapshot = await getDocs(couponsQuery);
    
    if (couponsSnapshot.empty) {
      console.log('No coupons found for this business. Please create some coupons first.');
      return;
    }
    
    const couponIds = couponsSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${couponIds.length} coupons`);
    
    // Next, get some customer IDs for this business
    const customersRef = collection(db, 'customers');
    const customersQuery = query(customersRef, where('businessId', '==', businessId));
    const customersSnapshot = await getDocs(customersQuery);
    
    if (customersSnapshot.empty) {
      console.log('No customers found for this business. Using anonymous scans only.');
    }
    
    const customerIds = customersSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${customerIds.length} customers`);
    
    // Generate and add the scan events
    const qrCodeScansRef = collection(db, 'qrCodeScans');
    
    for (let i = 0; i < numScans; i++) {
      const scanEvent = generateRandomScanEvent(businessId, couponIds, customerIds);
      await addDoc(qrCodeScansRef, scanEvent);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Added ${i + 1} scan events...`);
      }
    }
    
    console.log(`Successfully added ${numScans} QR code scan events!`);
  } catch (error) {
    console.error('Error seeding QR code scans:', error);
  }
}

// Get business ID from command line argument
const businessId = process.argv[2];

if (!businessId) {
  console.error('Please provide a business ID as a command line argument');
  process.exit(1);
}

// Seed the database
seedQRCodeScans(businessId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });