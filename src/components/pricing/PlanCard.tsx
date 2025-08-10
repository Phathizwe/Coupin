import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PricingPlan } from '@/types/billing.types';
import { currencyService } from '@/services/currency/currencyService';

interface PlanCardProps {
  plan: PricingPlan;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const [formattedPrice, setFormattedPrice] = useState<string>('');
  
  useEffect(() => {
    const loadFormattedPrice = async () => {
      const formatted = await currencyService.formatPrice(plan.price, plan.currency);
      setFormattedPrice(formatted);
    };
    
    loadFormattedPrice();
  }, [plan.price, plan.currency]);

  const renderFeatureItem = (feature: { name: string; included: boolean; highlight?: boolean }) => (
    <li key={feature.name} className="flex items-start space-x-3 py-2">
      {feature.included ? (
        <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" aria-hidden="true" />
      ) : (
        <XMarkIcon className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" aria-hidden="true" />
      )}
      <span className={`text-sm ${feature.highlight ? 'font-semibold' : ''} ${feature.included ? 'text-gray-800' : 'text-gray-500'}`}>
        {feature.name}
      </span>
    </li>
  );

  // Special discount messages for specific plans in ZAR
  const getDiscountMessage = () => {
    if (plan.currency === 'ZAR') {
      if (plan.id === 'growth') {
        return <p className="text-sm text-green-600 mt-1">Was R249 - reduced for better conversion</p>;
      }
      if (plan.id === 'professional') {
        return <p className="text-sm text-green-600 mt-1">Was R499 - more accessible</p>;
      }
    }
    return null;
};

  return (
    <div
      className={`relative rounded-2xl shadow-lg overflow-hidden border-2 ${
        plan.popularPlan ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-100'
      } bg-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      {plan.popularPlan && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white py-1 px-4 rounded-bl-lg text-sm font-medium">
          Recommended
        </div>
      )}
      
      <div className="p-6 lg:p-8">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
        
        <div className="mt-6">
          <p className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">
              {formattedPrice || `${plan.currency} ${plan.price}`}
            </span>
            <span className="ml-1 text-xl font-medium text-gray-500">/{plan.billingCycle}</span>
          </p>
          {getDiscountMessage()}
        </div>
        
        {/* Value proposition */}
        {plan.valueProposition && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 italic">"{plan.valueProposition}"</p>
          </div>
        )}
        
        <div className="mt-8">
          <Link
            to="/register"
            className={`block w-full text-center px-6 py-3 border border-transparent rounded-md shadow text-base font-medium ${
              plan.popularPlan
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : plan.price === 0
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'bg-white border-primary-600 text-primary-600 hover:bg-primary-50'
            } transition-colors duration-200`}
          >
            {plan.ctaText || 'Get started'}
          </Link>
        </div>
      </div>
      
      <div className="px-6 pb-8 lg:px-8">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          What's included
        </h4>
        <ul className="space-y-1">
          {plan.features.map(feature => renderFeatureItem(feature))}
        </ul>
      </div>
    </div>
  );
};