"use client";
import React, { useState, useEffect } from "react";
import { Globe, ChevronDownIcon, RefreshCw } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RegionSelector } from "./region-selector";
import { CurrencySelector } from "./currency-selector";
import { LoadingState } from "./loading-state";
import { useRegionDetection } from "@/hooks/useRegionDetection";
import { Button } from "@/components/ui/button";

interface CurrencyRegionSetterProps {
  defaultCurrency?: string;
  defaultRegion?: string;
  onCurrencyChange?: (currency: string) => void;
  onRegionChange?: (region: string) => void;
}

export function CurrencyRegionSetter({
  defaultCurrency = "USD",
  defaultRegion = "US",
  onCurrencyChange,
  onRegionChange,
}: CurrencyRegionSetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const {
    currencies,
    regions,
    selectedCurrency,
    selectedRegion,
    isLoading,
    setSelectedCurrency,
    setSelectedRegion,
    resetToDetected,
    detectedRegion
  } = useRegionDetection(
    defaultCurrency,
    defaultRegion,
    onCurrencyChange,
    onRegionChange
  );

  // Debug: Log when currency changes in this component
  useEffect(() => {
    console.log('[CurrencyRegionSetter] Selected currency changed to:', selectedCurrency);
  }, [selectedCurrency]);

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || 
    { code: "USD", name: "US Dollar", symbol: "$" };
  
  const selectedRegionData = regions.find(r => r.code === selectedRegion) || 
    { code: "US", name: "United States", flag: "🇺🇸" };

  const handleResetToDetected = async () => {
    setIsResetting(true);
    await resetToDetected();
    setIsResetting(false);
  };

  const handleCurrencyChange = (code: string) => {
    console.log('[CurrencyRegionSetter] Currency selection changed to:', code);
    setSelectedCurrency(code);
    // Manually trigger a global event to ensure all components are notified
    document.dispatchEvent(new CustomEvent('currency-changed', { 
      detail: { currency: code } 
    }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full max-w-md mx-auto" id="currency-region-selector">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between gap-3 p-4 rounded-lg border border-input bg-background hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl">{selectedRegionData?.flag}</span>
                <span className="font-medium">{selectedRegionData?.name}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedCurrencyData?.symbol} {selectedCurrencyData?.code}</span>
              </div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm text-foreground mb-1">Currency & Region Settings</h3>
            <p className="text-xs text-muted-foreground">Choose your preferred currency and region</p>
          </div>
          <div className="p-4 space-y-4">
            <RegionSelector
              regions={regions}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              selectedRegionData={selectedRegionData}
            />
            <CurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
              selectedCurrencyData={selectedCurrencyData}
            />
            
            {detectedRegion && detectedRegion !== selectedRegion && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  We detected that you're in {regions.find(r => r.code === detectedRegion)?.name || detectedRegion}.
                  Would you like to use that region instead?
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleResetToDetected}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      <span>Use Detected Region</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current selection:</span>
              <span className="font-medium">
                {selectedRegionData?.flag} {selectedCurrencyData?.symbol} {selectedCurrencyData?.code}
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}