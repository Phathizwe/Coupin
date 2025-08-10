import React from 'react';

interface CouponTemplatesProps {
  onUseTemplate: () => void;
}

const CouponTemplates: React.FC<CouponTemplatesProps> = ({ onUseTemplate }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Customer Retention Templates</h2>
      <p className="text-gray-600 mb-4">Start with a proven retention strategy to keep customers coming back.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">Win-Back Campaign</h3>
              <p className="text-sm text-gray-600">Re-engage customers who haven't visited in 30+ days with a special offer.</p>
              <p className="text-xs text-green-600 mt-1">Typically recovers 15-20% of inactive customers</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">High ROI</span>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
        
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div>
            <h3 className="font-medium text-lg">Loyalty Reward</h3>
            <p className="text-sm text-gray-600">Thank repeat customers with an exclusive offer to encourage continued loyalty.</p>
            <p className="text-xs text-green-600 mt-1">Increases customer lifetime value by up to 30%</p>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
        
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div>
            <h3 className="font-medium text-lg">Purchase Frequency Booster</h3>
            <p className="text-sm text-gray-600">Encourage customers to return sooner with a time-limited follow-up offer.</p>
            <p className="text-xs text-green-600 mt-1">Shortens average time between purchases by 40%</p>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div>
            <h3 className="font-medium text-lg">Spend Increase Incentive</h3>
            <p className="text-sm text-gray-600">Motivate customers to spend more with tiered discount levels.</p>
            <p className="text-xs text-green-600 mt-1">Increases average order value by 15-25%</p>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
        
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div>
            <h3 className="font-medium text-lg">Anniversary Celebration</h3>
            <p className="text-sm text-gray-600">Celebrate customer milestones with personalized offers that strengthen relationships.</p>
            <p className="text-xs text-green-600 mt-1">90% higher engagement than standard promotions</p>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
        
        <div 
          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
          onClick={onUseTemplate}
        >
          <div>
            <h3 className="font-medium text-lg">Referral Reward</h3>
            <p className="text-sm text-gray-600">Incentivize existing customers to refer friends while strengthening their own loyalty.</p>
            <p className="text-xs text-green-600 mt-1">Referred customers have 37% higher retention</p>
          </div>
          <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
            Use This Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponTemplates;