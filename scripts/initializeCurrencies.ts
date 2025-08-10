import { db } from '../src/config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const initializeCurrencies = async () => {
  try {
    // Initialize USD
    await setDoc(doc(db, 'currencies', 'USD'), {
      name: 'US Dollar',
      symbol: '$',
      isActive: true,
      rates: {
        ZAR: 18.18,
        EUR: 0.91,
        GBP: 0.78,
        JPY: 149.1,
        CAD: 1.36,
        AUD: 1.51,
        CHF: 0.89,
        CNY: 7.27,
        INR: 83.6,
        BRL: 5.64
      },
      updatedAt: new Date()
    });
    
    // Initialize ZAR
    await setDoc(doc(db, 'currencies', 'ZAR'), {
      name: 'South African Rand',
      symbol: 'R',
      isActive: true,
      rates: {
        USD: 0.055,
        EUR: 0.05,
        GBP: 0.043,
        JPY: 8.2,
        CAD: 0.075,
        AUD: 0.083,
        CHF: 0.049,
        CNY: 0.4,
        INR: 4.6,
        BRL: 0.31
      },
      updatedAt: new Date()
    });
    
    console.log('Currencies initialized successfully');
  } catch (error) {
    console.error('Error initializing currencies:', error);
  }
};

initializeCurrencies();