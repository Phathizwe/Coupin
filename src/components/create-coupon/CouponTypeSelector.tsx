import React from 'react';

export interface CouponType {
  id: string;
  label: string;
  value: any;
  // Emotional design properties
  subtitle?: string;
  description?: string;
  icon?: string;
  customerView?: string;
  successRate?: string;
  popularity?: string;
}

interface CouponTypeSelectorProps {
  couponTypes: CouponType[];
  selectedType: string;
  onSelectType: (typeId: string) => void;
}

const CouponTypeSelector: React.FC<CouponTypeSelectorProps> = ({
  couponTypes,
  selectedType,
  onSelectType
}) => {
  return (
    <div className="p-4 border-b">
      <h2 className="text-sm font-medium text-gray-600 mb-2">SELECT COUPON TYPE</h2>
      <div className="grid grid-cols-2 gap-2">
        {couponTypes.map(type => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={`py-3 px-2 border rounded-lg text-center ${selectedType === type.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-800 border-gray-300'
              }`}
          >
            <div className="text-xs font-medium">{type.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CouponTypeSelector;