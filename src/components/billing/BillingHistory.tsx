import React from 'react';
import { animated } from '@react-spring/web';
import { BillingHistory as BillingHistoryType } from '../../types/billing.types';
import { formatPrice, formatDate } from '../../utils/pricing.utils';
import { useAnimations } from '../../hooks/useAnimations';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface BillingHistoryProps {
  history: BillingHistoryType[];
  className?: string;
  animation?: any; // Add animation prop
  animationPreference?: boolean; // Add animation preference prop
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ 
  history, 
  className = '',
  animation, // Use the passed animation
  animationPreference = true // Default to true
}) => {
  const { useStaggeredAnimation } = useAnimations();
  const { ref, trail } = useStaggeredAnimation(history, 50);
  
  // Empty state
  if (history.length === 0) {
    return (
      <animated.div 
        style={animationPreference ? animation : undefined}
        className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>
      
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No payment history available</p>
          <p className="text-gray-500 text-sm mt-2">
            Your payment history will appear here once you upgrade to a paid plan.
          </p>
      </div>
      </animated.div>
  );
  }
  
  return (
    <animated.div 
      style={animationPreference ? animation : undefined}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody ref={ref} className="divide-y divide-gray-200">
            {history.map((item, index) => (
              <animated.tr 
                key={item.id}
                style={animationPreference ? trail[index] : undefined}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {formatDate(item.paymentDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {item.planName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {formatPrice(item.amount, item.currency)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full 
                    ${item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {item.receiptUrl ? (
                    <a 
                      href={item.receiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              </animated.tr>
            ))}
          </tbody>
        </table>
      </div>
    </animated.div>
  );
};

export default BillingHistory;