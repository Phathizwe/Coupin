export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  active: boolean;
  businessId: string;
  createdAt: any;
  [key: string]: any;
}