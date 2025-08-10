import React from 'react';
import { DollarSign } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Currency } from '@/hooks/useRegionDetection';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  selectedCurrencyData?: Currency;
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  selectedCurrencyData
}: CurrencySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Currency
      </label>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
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
  );
}