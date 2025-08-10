import { db } from '@/config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * Setup currency data in Firestore
 */
export async function setupCurrencyData() {
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

/**
 * Update pricing plans to include multi-currency prices
 */
export async function updatePricingPlansWithCurrencyPrices() {
  try {
    const plansRef = collection(db, 'pricing_plans');

    // Example currency prices for the Growth plan
    const growthPlanCurrencyPrices = [
      { currencyCode: 'USD', price: 11.99 },
      { currencyCode: 'EUR', price: 9.99 },
      { currencyCode: 'GBP', price: 8.99 },
      { currencyCode: 'AUD', price: 16.99 },
    ];

    // Example currency prices for the Professional plan
    const proPlanCurrencyPrices = [
      { currencyCode: 'USD', price: 24.99 },
      { currencyCode: 'EUR', price: 19.99 },
      { currencyCode: 'GBP', price: 17.99 },
      { currencyCode: 'AUD', price: 32.99 },
    ];

    // Update Growth plan
    await setDoc(doc(plansRef, 'growth'), {
      currencyPrices: growthPlanCurrencyPrices
    }, { merge: true });
    console.log('Growth plan updated with currency prices');

    // Update Professional plan
    await setDoc(doc(plansRef, 'professional'), {
      currencyPrices: proPlanCurrencyPrices
    }, { merge: true });
    console.log('Professional plan updated with currency prices');

    console.log('Pricing plans updated with currency-specific prices');
  } catch (error) {
    console.error('Error updating pricing plans:', error);
  }
}

/**
 * Run all setup functions
 */
export async function setupMultiCurrencySystem() {
  await setupCurrencyData();
  await updatePricingPlansWithCurrencyPrices();
  console.log('Multi-currency system setup complete');
}