import React from 'react';

interface RedemptionItemProps {
  customerName: string;
  couponTitle: string;
  formattedDate: string;
}

const RedemptionItem: React.FC<RedemptionItemProps> = ({ 
  customerName, 
  couponTitle, 
  formattedDate 
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{customerName}</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      <p className="text-gray-600">{couponTitle}</p>
    </div>
  );
};

export default RedemptionItem;