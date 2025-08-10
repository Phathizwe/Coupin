import { CouponTypeOption } from '../components/EmotionalCouponTypeSelector';

export const couponTypes: CouponTypeOption[] = [
  {
    id: 'return',
    title: 'Bring Them Back',
    description: '10% OFF their next visit',
    icon: '🔄',
    color: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300'
  },
  {
    id: 'share',
    title: 'Share the Love',
    description: 'FREE APPETIZER with purchase',
    icon: '💝',
    color: 'bg-rose-100',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300'
  },
  {
    id: 'double',
    title: 'Double the Joy',
    description: 'BUY 1 GET 1 on select items',
    icon: '✌️',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300'
  },
  {
    id: 'custom',
    title: 'Your Special Touch',
    description: 'Create a custom offer',
    icon: '✨',
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300'
  }
];
