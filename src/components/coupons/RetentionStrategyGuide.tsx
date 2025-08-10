import React from 'react';

interface RetentionStrategyGuideProps {
  couponType: string;
}

const RetentionStrategyGuide: React.FC<RetentionStrategyGuideProps> = ({ couponType }) => {
  // Tailor advice based on the coupon type
  const getRetentionAdvice = () => {
    switch (couponType) {
      case 'percentage':
        return {
          title: 'Percentage Discount Strategy',
          advice: 'Percentage discounts work best for encouraging repeat purchases from existing customers. Consider 15-25% for re-engagement campaigns.',
          stats: 'Customers who receive percentage-based retention offers are 31% more likely to make a repeat purchase within 60 days.',
          bestFor: 'Win-back campaigns, loyalty rewards, and encouraging larger purchases from existing customers.'
        };
      case 'fixed':
        return {
          title: 'Fixed Amount Strategy',
          advice: 'Fixed amount discounts create a clear value proposition and work well for re-engaging inactive customers.',
          stats: 'Fixed amount offers typically generate 27% higher conversion rates than percentage offers for lapsed customers.',
          bestFor: 'Re-engaging inactive customers, setting minimum purchase thresholds, and creating predictable customer savings.'
        };
      case 'buyXgetY':
        return {
          title: 'Buy X Get Y Strategy',
          advice: 'This format encourages larger purchases while building loyalty through added value rather than discounting.',
          stats: 'Buy X Get Y offers increase average order value by 21% while maintaining healthy margins.',
          bestFor: 'Increasing purchase frequency, boosting average order value, and introducing customers to new products.'
        };
      case 'freeItem':
        return {
          title: 'Free Item Strategy',
          advice: 'Offering a free item creates a strong incentive for return visits and can introduce customers to new products.',
          stats: 'Free item promotions have a 24% higher redemption rate than equivalent cash discounts.',
          bestFor: 'Building emotional connection, product sampling, and creating memorable customer experiences.'
        };
      default:
        return {
          title: 'Customer Retention Strategy',
          advice: 'Focus your coupon strategy on keeping existing customers rather than just attracting new ones.',
          stats: 'Increasing customer retention by just 5% can increase profits by 25-95%.',
          bestFor: 'Building customer loyalty, increasing purchase frequency, and maximizing customer lifetime value.'
        };
    }
  };

  const advice = getRetentionAdvice();

  return (
    <div className="bg-blue-50 p-4 rounded-md mb-4">
      <h4 className="font-medium text-blue-800">{advice.title}</h4>
      <p className="text-sm text-blue-700 mt-1">
        {advice.advice}
      </p>
      
      <div className="mt-3 border-t border-blue-200 pt-2">
        <div className="flex items-start mt-2">
          <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-700">
            <span className="font-medium">Retention Impact:</span> {advice.stats}
          </p>
        </div>
        
        <div className="flex items-start mt-2">
          <svg className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-700">
            <span className="font-medium">Best For:</span> {advice.bestFor}
          </p>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-blue-600 italic">
        Remember: It costs 5-25x more to acquire a new customer than to retain an existing one.
      </div>
    </div>
  );
};

export default RetentionStrategyGuide;