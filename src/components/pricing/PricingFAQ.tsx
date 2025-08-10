import React from 'react';

const PricingFAQ: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto mt-24 divide-y-2 divide-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Frequently asked questions
      </h2>
      <dl className="mt-6 space-y-6 divide-y divide-gray-200">
        <div className="pt-6">
          <dt className="text-lg">
            <span className="font-medium text-gray-900">
              Can I create coupons for free?
            </span>
          </dt>
          <dd className="mt-2 text-base text-gray-500">
            Yes! Our Starter plan is free forever and lets you create and share unlimited coupons. You only pay when you need to redeem coupons.
          </dd>
        </div>
        <div className="pt-6">
          <dt className="text-lg">
            <span className="font-medium text-gray-900">
              Is there a free trial for paid plans?
            </span>
          </dt>
          <dd className="mt-2 text-base text-gray-500">
            Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.
          </dd>
        </div>
        <div className="pt-6">
          <dt className="text-lg">
            <span className="font-medium text-gray-900">
              Can I upgrade or downgrade my plan later?
            </span>
          </dt>
          <dd className="mt-2 text-base text-gray-500">
            Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive credit towards your next billing cycle.
          </dd>
        </div>
        <div className="pt-6">
          <dt className="text-lg">
            <span className="font-medium text-gray-900">
              What payment methods do you accept?
            </span>
          </dt>
          <dd className="mt-2 text-base text-gray-500">
            We accept all major credit cards, debit cards, and EFT payments. For annual plans, we can also arrange for invoice payment.
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default PricingFAQ;