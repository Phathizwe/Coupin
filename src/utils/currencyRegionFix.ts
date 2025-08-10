/**
 * Utility to fix the currency region selection issue
 * This ensures that when a user explicitly selects a currency,
 * it won't be automatically changed when the region changes
 */
export function applyUserCurrencyPreference() {
  // Check if there's a saved currency preference
  const savedCurrency = localStorage.getItem('userCurrency');
  const savedRegion = localStorage.getItem('userRegion');
  
  if (savedCurrency) {
    // Mark that this was explicitly set by the user
    localStorage.setItem('userExplicitCurrencyChoice', 'true');
    
    // Dispatch a custom event to notify all components
    document.dispatchEvent(new CustomEvent('currency-changed', { 
      detail: { 
        currency: savedCurrency,
        isExplicit: true
      } 
    }));
    
    console.log('[CurrencyRegionFix] Applied user currency preference:', savedCurrency);
  }
  
  // Add a global event listener to intercept region changes
  document.addEventListener('region-changed', (event: any) => {
    // If user has explicitly chosen a currency, don't auto-update it
    if (localStorage.getItem('userExplicitCurrencyChoice') === 'true') {
      console.log('[CurrencyRegionFix] Preserving user currency choice despite region change');
      
      // Re-dispatch the currency event to ensure it's respected
      const userCurrency = localStorage.getItem('userCurrency');
      if (userCurrency) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('currency-changed', { 
            detail: { 
              currency: userCurrency,
              isExplicit: true,
              preserveChoice: true
            } 
          }));
        }, 100);
      }
    }
  });
}