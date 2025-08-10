import React from 'react';
import { CouponFormData } from '../CouponFormTypes';
import InfoTooltip from '../../ui/InfoTooltip';
import RetentionStrategyGuide from '../RetentionStrategyGuide';

interface BasicInfoStepProps {
  formData: CouponFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onInputChange,
  onTextAreaChange,
  onSelectChange
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Retention Strategy Information</h3>
      
      {/* Add Retention Strategy Guide */}
      <RetentionStrategyGuide couponType={formData.type} />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coupon Title*
          <InfoTooltip text="Create a compelling title that communicates the value to returning customers" />
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Loyal Customer Reward: 20% Off Your Next Visit"
          required
          aria-describedby="title-help"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <InfoTooltip text="Explain how this offer helps reward customer loyalty" />
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onTextAreaChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., As a thank you for being a valued customer, enjoy this exclusive discount on your next purchase"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retention Strategy Type*
            <InfoTooltip text="Choose the strategy that best fits your customer retention goals" />
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={onSelectChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="percentage">Percentage Discount</option>
            <option value="fixed">Fixed Amount</option>
            <option value="buyXgetY">Buy X Get Y</option>
            <option value="freeItem">Free Item</option>
          </select>
        </div>
        
        {formData.type === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage Off*
              <InfoTooltip text="15-25% is optimal for retention offers" />
            </label>
            <input
              type="number"
              name="value"
              value={formData.value || ''}
              onChange={onInputChange}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        )}
        
        {formData.type === 'fixed' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Off*
              <InfoTooltip text="Fixed amounts create clear value for returning customers" />
            </label>
            <input
              type="number"
              name="value"
              value={formData.value || ''}
              onChange={onInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        )}
        
        {formData.type === 'buyXgetY' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buy Quantity*
                <InfoTooltip text="Encourages larger purchases from loyal customers" />
              </label>
              <input
                type="number"
                name="buyQuantity"
                value={formData.buyQuantity || ''}
                onChange={onInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Get Quantity*
                <InfoTooltip text="Rewards loyalty while maintaining margins" />
              </label>
              <input
                type="number"
                name="getQuantity"
                value={formData.getQuantity || ''}
                onChange={onInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </>
        )}
        
        {formData.type === 'freeItem' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Free Item*
              <InfoTooltip text="Free items create memorable experiences that build loyalty" />
            </label>
            <input
              type="text"
              name="freeItem"
              value={formData.freeItem}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Small Coffee"
              required
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date*
            <InfoTooltip text="Strategic timing can improve retention effectiveness" />
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate.toISOString().split('T')[0]}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date*
            <InfoTooltip text="Creating urgency increases redemption rates" />
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate.toISOString().split('T')[0]}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      </div>
      
      {/* Customer targeting tip */}
      <div className="mt-4 bg-green-50 p-3 rounded-md">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h4 className="font-medium text-green-800 text-sm">Pro Retention Tip</h4>
        </div>
        <p className="text-sm text-green-700 mt-1">
          After creating this coupon, use the Customers page to target specific customer segments like inactive customers or high-value regulars for maximum retention impact.
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;