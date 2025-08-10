import React from 'react';
import { CurrencyRegionSetter } from './currency-region-setter';

export default function CurrencyRegionSetterDemo() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Currency & Region Settings</h1>
          <p className="text-muted-foreground">Select your preferred currency and region for the best experience</p>
        </div>
        <CurrencyRegionSetter
          defaultCurrency="USD"
          defaultRegion="US"
          onCurrencyChange={(currency) => console.log("Currency changed to:", currency)}
          onRegionChange={(region) => console.log("Region changed to:", region)}
        />
        <div className="text-center text-sm text-muted-foreground">
          Click the selector above to change your preferences
        </div>
      </div>
    </div>
  );
}