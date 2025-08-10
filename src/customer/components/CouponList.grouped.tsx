import React, { useMemo } from 'react';
import { Coupon } from '../types/coupon.enhanced';
import CouponCard from './CouponCard.enhanced';

// Export the props interface
export interface CouponListProps {
  coupons: Coupon[];
  onCouponRedeemed: (coupon: Coupon) => void;
}

interface GroupedCoupons {
  [businessId: string]: {
    businessName: string;
    businessLogo?: string;
    businessColors?: {
      primary: string;
      secondary: string;
    };
    coupons: Coupon[];
  };
}

const CouponList: React.FC<CouponListProps> = ({ coupons, onCouponRedeemed }) => {
  // Group coupons by business ID
  const groupedCoupons = useMemo(() => {
    const grouped: GroupedCoupons = {};
    
    coupons.forEach(coupon => {
      const businessId = coupon.businessId;
      
      if (!grouped[businessId]) {
        grouped[businessId] = {
          businessName: coupon.businessName || 'Unknown Business',
          businessLogo: coupon.businessLogo,
          businessColors: coupon.businessColors,
          coupons: []
        };
      }
      
      grouped[businessId].coupons.push(coupon);
    });
    
    return grouped;
  }, [coupons]);
  
  // Convert the grouped object to an array for rendering
  const businessGroups = useMemo(() => {
    return Object.entries(groupedCoupons).map(([businessId, group]) => ({
      businessId,
      ...group
    }));
  }, [groupedCoupons]);

  return (
    <div className="space-y-8">
      {businessGroups.map(group => (
        <div key={group.businessId} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Business Header */}
          <div 
            className="p-4 border-b flex items-center"
            style={{ 
              backgroundColor: group.businessColors?.primary ? `${group.businessColors.primary}10` : '#f3f4f6',
              borderColor: group.businessColors?.primary ? `${group.businessColors.primary}40` : '#e5e7eb'
            }}
          >
            {group.businessLogo ? (
              <img 
                src={group.businessLogo} 
                alt={group.businessName} 
                className="w-10 h-10 rounded-full mr-3 object-cover border-2"
                style={{ borderColor: group.businessColors?.primary || '#3B82F6' }}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
                style={{ backgroundColor: group.businessColors?.primary || '#3B82F6' }}
              >
                <span className="font-semibold">
                  {group.businessName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 
                className="font-medium text-lg"
                style={{ color: group.businessColors?.primary || '#3B82F6' }}
              >
                {group.businessName}
              </h2>
              <p className="text-sm text-gray-500">
                {group.coupons.length} {group.coupons.length === 1 ? 'coupon' : 'coupons'} available
              </p>
            </div>
          </div>
          
          {/* Coupons Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.coupons.map(coupon => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  onRedeem={onCouponRedeemed}
                  compact={true} // Add a compact prop for a more condensed view in groups
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CouponList;