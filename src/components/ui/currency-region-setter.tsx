"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Globe, MapPin, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Select Components
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<
React.ElementRef<typeof SelectPrimitive.Trigger>,
React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
<SelectPrimitive.Trigger
ref={ref}
className={cn(
"flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-start text-sm text-foreground shadow-sm shadow-black/5 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground/70 [&>span]:min-w-0",
className,
)}
{...props}
>
{children}
<SelectPrimitive.Icon asChild>
<ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
</SelectPrimitive.Icon>
</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
React.ElementRef<typeof SelectPrimitive.Content>,
React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
<SelectPrimitive.Portal>
<SelectPrimitive.Content
ref={ref}
className={cn(
"relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-lg border border-input bg-popover text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 [&_[role=group]]:py-1",
position === "popper" &&
"w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
className,
)}
position={position}
{...props}
>
<SelectPrimitive.Viewport
className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)]")}
>
{children}
</SelectPrimitive.Viewport>
</SelectPrimitive.Content>
</SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
React.ElementRef<typeof SelectPrimitive.Item>,
React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
<SelectPrimitive.Item
ref={ref}
className={cn(
"relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pe-2 ps-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
className,
)}
{...props}
>
<span className="absolute start-2 flex size-3.5 items-center justify-center">
<SelectPrimitive.ItemIndicator>
<CheckIcon className="h-4 w-4" />
</SelectPrimitive.ItemIndicator>
</span>
<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

// Popover Components
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
React.ElementRef<typeof PopoverPrimitive.Content>,
React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
<PopoverPrimitive.Portal>
<PopoverPrimitive.Content
ref={ref}
align={align}
sideOffset={sideOffset}
className={cn(
"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
className
)}
{...props}
/>
</PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

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
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [isOpen, setIsOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Array<{code: string; name: string; symbol: string}>>([]);
  const [regions, setRegions] = useState<Array<{code: string; name: string; flag: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect user's region using the geolocation API
    const detectUserRegion = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.country) {
          setSelectedRegion(data.country);
          
          // Set currency based on region
          const regionCurrency = getDefaultCurrencyForRegion(data.country);
          if (regionCurrency) {
            setSelectedCurrency(regionCurrency);
            onCurrencyChange?.(regionCurrency);
          }
          
          onRegionChange?.(data.country);
        }
      } catch (error) {
        console.error('Error detecting user region:', error);
      }
    };

    // Load currencies from Firestore
    const loadCurrenciesAndRegions = async () => {
      try {
        setIsLoading(true);
        
        // Regions will be loaded from a static list for now
        const regionsList = [
          { code: "US", name: "United States", flag: "🇺🇸" },
          { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
          { code: "DE", name: "Germany", flag: "🇩🇪" },
          { code: "FR", name: "France", flag: "🇫🇷" },
          { code: "JP", name: "Japan", flag: "🇯🇵" },
          { code: "CA", name: "Canada", flag: "🇨🇦" },
          { code: "AU", name: "Australia", flag: "🇦🇺" },
          { code: "CH", name: "Switzerland", flag: "🇨🇭" },
          { code: "CN", name: "China", flag: "🇨🇳" },
          { code: "IN", name: "India", flag: "🇮🇳" },
          { code: "BR", name: "Brazil", flag: "🇧🇷" },
        ];
        setRegions(regionsList);
        
        // Currencies will be loaded from Firestore in the CurrencyService
        // For now, use a fallback list
        const fallbackCurrencies = [
          { code: "USD", name: "US Dollar", symbol: "$" },
          { code: "EUR", name: "Euro", symbol: "€" },
          { code: "GBP", name: "British Pound", symbol: "£" },
          { code: "JPY", name: "Japanese Yen", symbol: "¥" },
          { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
          { code: "AUD", name: "Australian Dollar", symbol: "A$" },
          { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
          { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
          { code: "INR", name: "Indian Rupee", symbol: "₹" },
          { code: "BRL", name: "Brazilian Real", symbol: "R$" },
        ];
        
        // This will be replaced with Firestore fetch
        setCurrencies(fallbackCurrencies);
        
        setIsLoading(false);
        
        // Detect user region after loading initial data
        detectUserRegion();
      } catch (error) {
        console.error('Error loading currencies and regions:', error);
        setIsLoading(false);
      }
    };

    loadCurrenciesAndRegions();
  }, [onCurrencyChange, onRegionChange]);

  const getDefaultCurrencyForRegion = (regionCode: string): string => {
    const regionCurrencyMap: Record<string, string> = {
      'US': 'USD',
      'GB': 'GBP',
      'DE': 'EUR',
      'FR': 'EUR',
      'JP': 'JPY',
      'CA': 'CAD',
      'AU': 'AUD',
      'CH': 'CHF',
      'CN': 'CNY',
      'IN': 'INR',
      'BR': 'BRL',
    };
    
    return regionCurrencyMap[regionCode] || 'USD';
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    onCurrencyChange?.(value);
    
    // Save to localStorage for persistence
    localStorage.setItem('userCurrency', value);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    onRegionChange?.(value);
    
    // Save to localStorage for persistence
    localStorage.setItem('userRegion', value);
  };

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || { code: "USD", name: "US Dollar", symbol: "$" };
  const selectedRegionData = regions.find(r => r.code === selectedRegion) || { code: "US", name: "United States", flag: "🇺🇸" };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4 items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Region
              </label>
              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedRegionData?.flag}</span>
                      <span>{selectedRegionData?.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{region.flag}</span>
                        <span>{region.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Currency
              </label>
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{selectedCurrencyData?.symbol}</span>
                      <span>{selectedCurrencyData?.code}</span>
                      <span className="text-muted-foreground">- {selectedCurrencyData?.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-6">{currency.symbol}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-muted-foreground">- {currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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