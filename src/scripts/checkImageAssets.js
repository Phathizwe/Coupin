// Script to check for missing images in Firebase Storage
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_px307ityLaMaEG-TqT-Ssz3CT-AhJ6Y",
  authDomain: "coupin-f35d2.firebaseapp.com",
  projectId: "coupin-f35d2",
  storageBucket: "coupin-f35d2.appspot.com",
  messagingSenderId: "757183919417",
  appId: "1:757183919417:web:6c0146510173250129a4e8",
  measurementId: "G-R0XYKGNZ9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Required image paths based on the codebase
const requiredImages = [
  'logos/default-logo.png',
  'mascots/coupon-mascot.png',
  'mascots/coupon-mascot-happy.png',
  'mascots/coupon-mascot-excited.png',
  'mascots/coupon-mascot-helping.png',
  'ui/celebration-confetti.gif',
  'ui/sparkle-effect.gif',
  'ui/achievement-badge.png',
  'hero-image.jpg'
];

async function checkImages() {
  console.log('Checking for missing images...');
  
  let missingImages = 0;
  
  for (const imagePath of requiredImages) {
    try {
      const imageRef = ref(storage, imagePath);
      await getDownloadURL(imageRef);
      console.log(`✅ Image exists: ${imagePath}`);
    } catch (error) {
      console.error(`❌ Missing image: ${imagePath}`);
      console.log(`Please upload this image to Firebase Storage at path: ${imagePath}`);
      missingImages++;
    }
  }
  
  if (missingImages > 0) {
    console.log(`\n⚠️ Found ${missingImages} missing images. Please upload them to Firebase Storage.`);
  } else {
    console.log('\n✅ All required images are present in Firebase Storage.');
}
}

checkImages().catch(console.error);