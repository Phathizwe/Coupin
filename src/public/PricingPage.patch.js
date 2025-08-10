// This is a patch file showing only the changes needed to fix the ZAR currency issue
// in the PricingPage.tsx component

// Modified handleCurrencyChange function:
const handleCurrencyChange = (newCurrency: string) => {
  console.log('[PricingPage] Setting currency to:', newCurrency);
  
  // Mark that this was explicitly set by the user
  localStorage.setItem('userExplicitCurrencyChoice', 'true');
  
  // Set the currency
  setCurrency(newCurrency);
};