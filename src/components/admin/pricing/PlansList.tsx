import React from 'react';
import { PricingPlan } from '@/types/billing.types';
import { Currency } from '@/services/currencyService';

interface PlansListProps {
  plans: PricingPlan[];
  currencies: Currency[];
  onEditPlan: (plan: PricingPlan) => void;
}

const PlansList: React.FC<PlansListProps> = ({ plans, currencies, onEditPlan }) => {
  // Sort plans by displayOrder if it exists, otherwise keep original order
  const sortedPlans = [...plans].sort((a, b) => {
    const orderA = a.displayOrder !== undefined ? a.displayOrder : 999;
    const orderB = b.displayOrder !== undefined ? b.displayOrder : 999;
    return orderA - orderB;
  });

  if (sortedPlans.length === 0) {
    return (
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
          No pricing plans found
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      <ul className="divide-y divide-gray-200">
        {sortedPlans.map((plan) => (
          <li key={plan.id} className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                  {plan.displayOrder !== undefined && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Order: {plan.displayOrder}
                    </span>
                  )}
                  {plan.popularPlan && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Popular
                    </span>
                  )}
                  {plan.active === false && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <p className="text-base font-medium mt-2">
                  {plan.price} {plan.currency} per {plan.billingCycle}
                </p>
                
                {plan.currencyPrices && plan.currencyPrices.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Currency-specific prices:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {plan.currencyPrices.map(cp => {
                        const currency = currencies.find(c => c.code === cp.currencyCode);
                        return (
                          <span key={cp.currencyCode} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {currency?.symbol}{cp.price} {cp.currencyCode}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onEditPlan(plan)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Edit Prices
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlansList;