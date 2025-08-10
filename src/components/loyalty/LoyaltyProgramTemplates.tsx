import React from 'react';

interface LoyaltyProgramTemplatesProps {
  onTemplateSelect: (templateType: string) => void;
}

const LoyaltyProgramTemplates: React.FC<LoyaltyProgramTemplatesProps> = ({
  onTemplateSelect
}) => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Program Templates</h2>
      <p className="text-sm text-gray-600 mb-4">
        Get started quickly with one of our pre-designed loyalty program templates.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onTemplateSelect('points')}
        >
          <h3 className="font-medium">Points Program</h3>
          <p className="text-sm text-gray-600">Customers earn points for purchases and actions.</p>
        </div>
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onTemplateSelect('tiered')}
        >
          <h3 className="font-medium">Tiered VIP Program</h3>
          <p className="text-sm text-gray-600">Reward your best customers with exclusive benefits.</p>
        </div>
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onTemplateSelect('visits')}
        >
          <h3 className="font-medium">Visit-Based Program</h3>
          <p className="text-sm text-gray-600">Reward customers based on visit frequency.</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgramTemplates;