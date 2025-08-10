import React, { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PricingPlan } from '@/types/billing.types';
import { Currency } from '@/services/currencyService';

interface PlanCreatorProps {
  currencies: Currency[];
  existingPlansCount: number;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onPlanCreated: () => void;
  onCancel: () => void;
}

// Initial plan template
const getInitialPlan = (displayOrder: number, defaultCurrency: string = 'USD'): Omit<PricingPlan, 'id'> => ({
  name: '',
  description: '',
  price: 0,
  currency: defaultCurrency,
  billingCycle: 'month',
  popularPlan: false,
  active: true,
  displayOrder: displayOrder, // New field for controlling display order
  features: [],
  currencyPrices: []
});

const PlanCreator: React.FC<PlanCreatorProps> = ({
  currencies,
  existingPlansCount,
  onSuccess,
  onError,
  onPlanCreated,
  onCancel
}) => {
  const [newPlan, setNewPlan] = useState<Omit<PricingPlan, 'id'>>(
    getInitialPlan(existingPlansCount) // Set initial display order to the end of the list
  );
  const [isCreating, setIsCreating] = useState(false);
  const [featureName, setFeatureName] = useState('');
  const [featureIncluded, setFeatureIncluded] = useState(true);
  const [featureHighlight, setFeatureHighlight] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setNewPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (field: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleInputChange(field, numValue);
  };

  const handleCurrencyPriceChange = (currencyCode: string, price: string) => {
    const numericPrice = price === '' ? 0 : parseFloat(price);
    
    const updatedPrices = [...(newPlan.currencyPrices || [])];
    const existingPriceIndex = updatedPrices.findIndex(cp => cp.currencyCode === currencyCode);
    
    if (existingPriceIndex >= 0) {
      updatedPrices[existingPriceIndex] = {
        ...updatedPrices[existingPriceIndex],
        price: numericPrice
      };
    } else {
      updatedPrices.push({
        currencyCode,
        price: numericPrice
      });
    }
    
    setNewPlan(prev => ({
      ...prev,
      currencyPrices: updatedPrices
    }));
  };

  const addFeature = () => {
    if (!featureName.trim()) return;
    
    const newFeature = {
      id: `feature-${Date.now()}`,
      name: featureName,
      included: featureIncluded,
      highlight: featureHighlight
    };
    
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
    
    // Reset feature form
    setFeatureName('');
    setFeatureIncluded(true);
    setFeatureHighlight(false);
  };

  const removeFeature = (featureId: string) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureId)
    }));
  };

  const createPlan = async () => {
    // Validate required fields
    if (!newPlan.name.trim()) {
      onError('Plan name is required');
      return;
    }

    setIsCreating(true);
    try {
      // Add the new plan to Firestore
      const plansRef = collection(db, 'pricing_plans');
      await addDoc(plansRef, {
        ...newPlan,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      onSuccess(`Successfully created new pricing plan: ${newPlan.name}`);
      onPlanCreated();
    } catch (err) {
      console.error('Error creating pricing plan:', err);
      onError(`Failed to create pricing plan: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 py-5">
      <h3 className="text-lg font-medium mb-4">Create New Pricing Plan</h3>
      
      <div className="space-y-6">
        {/* Basic Plan Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name*
            </label>
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Starter, Professional"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newPlan.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Perfect for small businesses"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Pricing Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newPlan.price}
              onChange={(e) => handleNumberInput('price', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Currency
            </label>
            <select
              value={newPlan.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Cycle
            </label>
            <select
              value={newPlan.billingCycle}
              onChange={(e) => handleInputChange('billingCycle', e.target.value as 'month' | 'year')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={newPlan.displayOrder}
              onChange={(e) => handleNumberInput('displayOrder', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
          </div>
        </div>
        
        {/* Additional Options */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="popularPlan"
              type="checkbox"
              checked={newPlan.popularPlan || false}
              onChange={(e) => handleInputChange('popularPlan', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="popularPlan" className="ml-2 block text-sm text-gray-700">
              Popular Plan (Highlight on pricing page)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="activePlan"
              type="checkbox"
              checked={newPlan.active || false}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="activePlan" className="ml-2 block text-sm text-gray-700">
              Active (Visible to users)
            </label>
          </div>
        </div>
        
        {/* Currency-Specific Prices */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Currency-Specific Prices</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map(currency => {
              // Skip the base currency as it's already set in the main price field
              if (currency.code === newPlan.currency) return null;
              
              const currencyPrice = newPlan.currencyPrices?.find(
                cp => cp.currencyCode === currency.code
              );
              
              return (
                <div key={currency.code} className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">{currency.code}</span>
                    <span className="text-sm text-gray-500">{currency.name} ({currency.symbol})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">{currency.symbol}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currencyPrice?.price || ''}
                      onChange={(e) => handleCurrencyPriceChange(currency.code, e.target.value)}
                      placeholder="Enter price"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border-gray-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Features Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Plan Features</h4>
          
          {/* Feature List */}
          {newPlan.features.length > 0 && (
            <div className="mb-4">
              <ul className="divide-y divide-gray-200 border rounded-md">
                {newPlan.features.map((feature) => (
                  <li key={feature.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`${feature.highlight ? 'font-medium' : ''}`}>
                        {feature.name}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {feature.included ? 'Included' : 'Not Included'}
                      </span>
                      {feature.highlight && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Highlighted
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Add Feature Form */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Add Feature</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="Feature name (e.g., Up to 500 customers)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="featureIncluded"
                    type="checkbox"
                    checked={featureIncluded}
                    onChange={(e) => setFeatureIncluded(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="featureIncluded" className="ml-2 block text-sm text-gray-700">
                    Included
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="featureHighlight"
                    type="checkbox"
                    checked={featureHighlight}
                    onChange={(e) => setFeatureHighlight(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="featureHighlight" className="ml-2 block text-sm text-gray-700">
                    Highlight
                  </label>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={addFeature}
              disabled={!featureName.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md disabled:opacity-50"
            >
              Add Feature
            </button>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={createPlan}
          disabled={isCreating || !newPlan.name.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </div>
  );
};

export default PlanCreator;