export interface Business {
  id: string;
  businessName: string;
  industry: string;
  logo?: string;
  description?: string;
  address?: string;
  couponCount: number;
  colors?: {
    primary: string;
    secondary: string;
  };
}