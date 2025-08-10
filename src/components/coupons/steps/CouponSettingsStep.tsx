import React from 'react';
import { CouponFormData } from '../CouponFormTypes';
import InfoTooltip from '../../ui/InfoTooltip';

interface CouponSettingsStepProps {
  formData: CouponFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const CouponSettingsStep: React.FC<CouponSettingsStepProps> = ({
  formData,
  onInputChange,
  onTextAreaChange
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Coupon Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code*
            <InfoTooltip text="This is what customers will enter at checkout" />
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., SUMMER20"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Purchase
            <InfoTooltip text="Minimum amount customer must spend to use this coupon" />
          </label>
          <input
            type="number"
            name="minPurchase"
            value={formData.minPurchase || ''}
            onChange={onInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., 50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usage Limit
            <InfoTooltip text="Maximum number of times this coupon can be used in total" />
          </label>
          <input
            type="number"
            name="usageLimit"
            value={formData.usageLimit || ''}
            onChange={onInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., 100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Per Customer Limit
            <InfoTooltip text="How many times each customer can use this coupon" />
          </label>
          <input
            type="number"
            name="customerLimit"
            value={formData.customerLimit || ''}
            onChange={onInputChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., 1"
          />
        </div>
      </div>
      
      {formData.type === 'percentage' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Discount
            <InfoTooltip text="Maximum amount that can be discounted (leave empty for no limit)" />
          </label>
          <input
            type="number"
            name="maxDiscount"
            value={formData.maxDiscount || ''}
            onChange={onInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., 100"
          />
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Terms and Conditions
          <InfoTooltip text="Any restrictions or special conditions customers should know" />
        </label>
        <textarea
          name="termsAndConditions"
          value={formData.termsAndConditions}
          onChange={onTextAreaChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Not valid with other offers. Cannot be combined with other discounts."
        />
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="firstTimeOnly"
            name="firstTimeOnly"
            checked={formData.firstTimeOnly}
            onChange={onInputChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="firstTimeOnly" className="ml-2 block text-sm text-gray-700">
            First-time customers only
            <InfoTooltip text="Limit this coupon to customers who haven't made a purchase before" />
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="birthdayOnly"
            name="birthdayOnly"
            checked={formData.birthdayOnly}
            onChange={onInputChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="birthdayOnly" className="ml-2 block text-sm text-gray-700">
            Birthday month only
            <InfoTooltip text="Limit this coupon to customers during their birthday month" />
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={onInputChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Make coupon active immediately
            <InfoTooltip text="If unchecked, coupon will be saved as inactive and can be activated later" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CouponSettingsStep;