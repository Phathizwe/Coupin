import { currencySymbolService } from '@/services/currency/currencySymbolService';

export async function formatPrice(
  price: number,
  currency: string
): Promise<string> {
  const symbol = await currencySymbolService.getCurrencySymbol(currency);
  
  // Format with appropriate decimal places
  let formattedPrice: string;
  
  if (currency === 'JPY') {
    formattedPrice = Math.round(price).toString();
  } else {
    formattedPrice = price.toFixed(2);
  }
  
  return `${symbol}${formattedPrice}`;
}

// Simplified version for synchronous formatting when symbol is already known
export function formatPriceWithSymbol(
  price: number,
  symbol: string,
  currency: string
): string {
  let formattedPrice: string;
  
  if (currency === 'JPY') {
    formattedPrice = Math.round(price).toString();
  } else {
    formattedPrice = price.toFixed(2);
  }
  
  return `${symbol}${formattedPrice}`;
}