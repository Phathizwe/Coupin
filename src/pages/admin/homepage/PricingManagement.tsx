import React, { useState } from 'react';
import PricingManager from '@/components/admin/PricingManager';
import CurrencyManagement from '@/components/admin/currency/CurrencyManagement';

type TabType = 'pricing' | 'currencies';

const PricingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pricing');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pricing Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure pricing plans and currency options for the website
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'pricing'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Pricing Plans
          </button>
          <button
            onClick={() => setActiveTab('currencies')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'currencies'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Currencies
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'pricing' && <PricingManager />}
        {activeTab === 'currencies' && <CurrencyManagement />}
      </div>
    </div>
  );
};

export default PricingManagement;