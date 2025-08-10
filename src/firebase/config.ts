import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { app } from '../config/firebase';

// Get Firebase services from the already initialized app
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Comment out or remove the emulator connection code
// if (process.env.NODE_ENV === 'development') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     console.log('Connected to Firebase emulators');
//   } catch (error) {
//     console.error('Failed to connect to Firebase emulators:', error);
//   }
// }

export { db, auth, analytics };