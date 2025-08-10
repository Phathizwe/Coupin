import React from 'react';
import { CurrencyRegionSetter } from '@/components/ui/currency-region';
import { useRegionalSettings } from '@/contexts/RegionalSettingsContext';
import { useFormatters } from '@/hooks/useFormatters';

export default function SettingsPage() {
  const { settings, updateSettings } = useRegionalSettings();
  const { formatCurrency, formatDate, formatTime, formatDateTime } = useFormatters();
  
  const currentDate = new Date();
  const sampleAmount = 1234.56;
  
  const handleCurrencyChange = (currency: string) => {
    updateSettings({ currency });
  };
  
  const handleRegionChange = (region: string) => {
    updateSettings({ region });
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your regional preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Regional Settings</h2>
          <CurrencyRegionSetter
            defaultCurrency={settings.currency}
            defaultRegion={settings.region}
            onCurrencyChange={handleCurrencyChange}
            onRegionChange={handleRegionChange}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Currency Format</h3>
                <p className="text-lg font-semibold">{formatCurrency(sampleAmount)}</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date Format</h3>
                <p className="text-lg font-semibold">{formatDate(currentDate)}</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Time Format</h3>
                <p className="text-lg font-semibold">{formatTime(currentDate)}</p>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time Format</h3>
                <p className="text-lg font-semibold">{formatDateTime(currentDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}