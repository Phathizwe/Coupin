import React from 'react';

const CouponTips: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Customer Retention Strategies</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Re-engage inactive customers</h3>
            <p className="text-sm text-gray-600">Send special "We miss you" coupons to customers who haven't visited in 30+ days. This can recover up to 15% of lapsed customers.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Reward loyal customers</h3>
            <p className="text-sm text-gray-600">Customers who feel appreciated spend 67% more than new ones. Send exclusive offers to your most frequent visitors.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Encourage repeat purchases</h3>
            <p className="text-sm text-gray-600">Offer time-sensitive follow-up coupons after a purchase. This can increase your repeat purchase rate by up to 30%.</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium text-blue-800">Retention ROI</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Investing in existing customers yields 5-25x higher ROI than acquisition. A 5% increase in customer retention can increase profits by 25-95%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponTips;