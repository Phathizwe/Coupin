export interface Business {
  id: string;
  businessName?: string;
  name?: string; // Added for compatibility
  industry?: string;
  logo?: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  couponCount?: number;
  saved?: boolean;
  colors?: {
    primary: string;
    secondary: string;
  };
}