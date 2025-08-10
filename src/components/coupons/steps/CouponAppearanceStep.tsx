import React from 'react';
import { CouponFormData } from '../CouponFormTypes';
import CouponPreview from '../CouponPreview';
import InfoTooltip from '../../ui/InfoTooltip';
import { Coupon } from '../../../types';

interface CouponAppearanceStepProps {
  formData: CouponFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPreview: boolean;
  togglePreview: () => void;
}

const CouponAppearanceStep: React.FC<CouponAppearanceStepProps> = ({
  formData,
  onInputChange,
  showPreview,
  togglePreview
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Coupon Appearance</h3>
      
      <div className="mb-6">
        <button
          type="button"
          onClick={togglePreview}
          className="mb-4 text-primary-600 hover:text-primary-700 font-medium flex items-center"
          aria-expanded={showPreview}
          aria-controls="coupon-preview"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPreview ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}></path>
          </svg>
        </button>
        
        {showPreview && (
          <div id="coupon-preview" className="mb-4 border p-4 rounded-lg">
            <CouponPreview coupon={formData as Coupon} />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
            <InfoTooltip text="Choose a background color for your coupon" />
          </label>
          <input
            type="color"
            name="backgroundColor"
            value={formData.branding?.backgroundColor || '#ffffff'}
            onChange={onInputChange}
            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
            <InfoTooltip text="Choose a text color that contrasts with your background" />
          </label>
          <input
            type="color"
            name="textColor"
            value={formData.branding?.textColor || '#000000'}
            onChange={onInputChange}
            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-2">
          <svg className="inline-block w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          Your business logo will be automatically added to the coupon if available.
        </p>
      </div>
    </div>
  );
};

export default CouponAppearanceStep;