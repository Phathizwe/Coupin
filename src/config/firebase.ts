import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Firebase configuration with actual values from Firebase Console
// Note: While we've renamed the app to TYCA, we're keeping the original Firebase project IDs
// as changing these would require creating a new Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyB_px307ityLaMaEG-TqT-Ssz3CT-AhJ6Y",
  authDomain: "coupin-f35d2.firebaseapp.com",
  projectId: "coupin-f35d2",
  storageBucket: "coupin-f35d2.appspot.com",
  messagingSenderId: "757183919417",
  appId: "1:757183919417:web:6c0146510173250129a4e8",
  measurementId: "G-R0XYKGNZ9C"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Only connect to emulators if explicitly enabled (for local development)
if (process.env.REACT_APP_USE_EMULATORS === 'true') {
  const { connectFirestoreEmulator } = require('firebase/firestore');
  const { connectAuthEmulator } = require('firebase/auth');
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
  }
}

// Analytics helper function
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export { app, auth, db, storage, functions, analytics };
