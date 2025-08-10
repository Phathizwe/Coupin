import { CouponData } from '../types/TYCATypes';

// Sample data - in a real app, this would come from an API
export const sampleCoupons: CouponData[] = [
  {
    id: '1',
    title: '10% OFF Any Purchase',
    description: 'Valid for all menu items',
    code: 'SAVE10',
    discount: '10%',
    validUntil: 'Dec 31, 2023',
    usageCount: 45,
    maxUses: 100,
    active: true,
    type: 'percentage'
  },
  {
    id: '2',
    title: 'Buy 1 Get 1 Free',
    description: 'On all beverages',
    code: 'BOGO2023',
    discount: 'Buy 1 Get 1',
    validUntil: 'Nov 15, 2023',
    usageCount: 78,
    maxUses: 150,
    active: true,
    type: 'buyXgetY'
  },
  {
    id: '3',
    title: 'Free Appetizer',
    description: 'With purchase of any main course',
    code: 'APPETIZER',
    discount: 'Free Item',
    validUntil: 'Oct 30, 2023',
    usageCount: 23,
    maxUses: 50,
    active: false,
    type: 'freeItem'
  },
  {
    id: '4',
    title: '$5 OFF Your Order',
    description: 'Minimum purchase of $25',
    code: 'FIVE4U',
    discount: '$5',
    validUntil: 'Dec 15, 2023',
    usageCount: 12,
    maxUses: 200,
    active: true,
    type: 'fixed'
  }
];