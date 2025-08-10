import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Setup currency data in Firestore
 */
async function setupCurrencyData() {
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", isActive: true },
    { code: "EUR", name: "Euro", symbol: "€", isActive: true },
    { code: "GBP", name: "British Pound", symbol: "£", isActive: true },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", isActive: true },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", isActive: true },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", isActive: true },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", isActive: true },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", isActive: true },
    { code: "INR", name: "Indian Rupee", symbol: "₹", isActive: true },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", isActive: true },
    { code: "ZAR", name: "South African Rand", symbol: "R", isActive: true },
  ];

  try {
    for (const currency of currencies) {
      await setDoc(doc(db, 'currencies', currency.code), currency);
      console.log(`Currency ${currency.code} added`);
    }

    console.log('Currency data setup completed');
  } catch (error) {
    console.error('Error setting up currency data:', error);
  }
}

// Run the setup function
export async function setupCurrencySystem() {
  await setupCurrencyData();
}