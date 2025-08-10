import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { addCoupon, generateCouponCodeForBusiness } from '../../services/couponService';
import { Coupon } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { CouponFormData, getInitialFormState, mergeTemplateData, validateCouponForm } from './CouponFormTypes';

interface CreateCouponModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (coupon: Coupon) => void;
  onCouponCreated?: (coupon: Coupon) => void;
  templateData?: Partial<Coupon>;
  templateType?: string;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  isOpen = false,
  onClose,
  onSave,
  onCouponCreated,
  templateData,
  templateType
}) => {
  const { user, businessProfile } = useAuth();
  const businessId = user?.businessId || user?.currentBusinessId || (user?.role === 'business' ? user?.uid : '');
  // Get business name safely without relying on specific properties
  const businessName = businessProfile ?
    // Try to access common business name properties
    (businessProfile as any).businessName ||
    (businessProfile as any).name ||
    (businessProfile as any).displayName ||
    '' : '';

  const initialFormState = useMemo(() => {
    const baseState = getInitialFormState();
    return templateData ? mergeTemplateData(baseState, templateData) : baseState;
  }, [templateData]);

  const [formData, setFormData] = useState<CouponFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setError(null);
    }
  }, [isOpen, initialFormState]);

  // Generate coupon code when modal opens
  useEffect(() => {
    let isMounted = true;

    if (businessId && !formData.code && isOpen) {
      setIsLoading(true);

      generateCouponCodeForBusiness(businessId)
        .then(code => {
          if (isMounted) {
            setFormData(prev => ({ ...prev, code }));
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error('Error generating coupon code:', error);
            setError('Failed to generate coupon code. Please try again.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [businessId, isOpen, formData.code]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleDateChange = useCallback((name: string, date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationResult = validateCouponForm(formData);
    if (!validationResult.isValid) {
      // Convert validation result to the format expected by setErrors
      const errorObj: Record<string, string> = {};
      // This is a simplified approach - in a real app, you'd map specific validation errors to fields
      if (validationResult.errorMessage) {
        errorObj['general'] = validationResult.errorMessage;
      }
      setErrors(errorObj);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Make a copy of the form data
      let finalFormData = { ...formData };

      // Generate a code if one doesn't exist
      if (!finalFormData.code) {
        const code = await generateCouponCodeForBusiness(businessId);
        finalFormData = { ...finalFormData, code };
      }

      // Create a clean object to send to Firestore that won't have undefined values
      const couponData: Record<string, any> = {
        businessId,
        title: finalFormData.title,
        description: finalFormData.description,
        code: finalFormData.code,
        type: finalFormData.type,
        value: finalFormData.value,
        active: finalFormData.active !== undefined ? finalFormData.active : true,
        startDate: finalFormData.startDate,
        endDate: finalFormData.endDate,
        usageLimit: finalFormData.usageLimit,
        customerLimit: finalFormData.customerLimit,
        firstTimeOnly: finalFormData.firstTimeOnly,
        birthdayOnly: finalFormData.birthdayOnly,
        branding: finalFormData.branding
      };

      // Add type-specific fields only when needed
      if (finalFormData.type === 'buyXgetY') {
        couponData.buyQuantity = finalFormData.buyQuantity || 1;
        couponData.getQuantity = finalFormData.getQuantity || 1;
      }

      if (finalFormData.type === 'freeItem') {
        couponData.freeItem = finalFormData.freeItem || '';
      }

      // Add the coupon
      const result = await addCoupon(couponData);

      // Call both callbacks for compatibility
      if (onSave) onSave(result as Coupon);
      if (onCouponCreated) onCouponCreated(result as Coupon);

      onClose();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      setError(error.message || 'Failed to create coupon. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {templateType ? `Create ${templateType} Coupon` : 'Create New Coupon'}
              </h3>

              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              {errors.general && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Discount Type
                    </label>
                    <select
                      name="type"
                      id="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${errors.type ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                      <option value="buyXgetY">Buy X Get Y</option>
                      <option value="freeItem">Free Item</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>

                  {/* Value (for percentage or fixed amount) */}
                  {(formData.type === 'percentage' || formData.type === 'fixed') && (
                    <div>
                      <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                        {formData.type === 'percentage' ? 'Percentage' : 'Amount'}
                      </label>
                      <input
                        type="number"
                        name="value"
                        id="value"
                        min="0"
                        value={formData.value}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${errors.value ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      />
                      {errors.value && (
                        <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                      )}
                    </div>
                  )}

                  {/* Free Item (for freeItem type) */}
                  {formData.type === 'freeItem' && (
                    <div>
                      <label htmlFor="freeItem" className="block text-sm font-medium text-gray-700">
                        Free Item
                      </label>
                      <input
                        type="text"
                        name="freeItem"
                        id="freeItem"
                        value={formData.freeItem || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full border ${errors.freeItem ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      />
                      {errors.freeItem && (
                        <p className="mt-1 text-sm text-red-600">{errors.freeItem}</p>
                      )}
                    </div>
                  )}

                  {/* Buy X Get Y (for buyXgetY type) */}
                  {formData.type === 'buyXgetY' && (
                    <>
                      <div>
                        <label htmlFor="buyQuantity" className="block text-sm font-medium text-gray-700">
                          Buy Quantity
                        </label>
                        <input
                          type="number"
                          name="buyQuantity"
                          id="buyQuantity"
                          min="1"
                          value={formData.buyQuantity || 1}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${errors.buyQuantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                        />
                        {errors.buyQuantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.buyQuantity}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="getQuantity" className="block text-sm font-medium text-gray-700">
                          Get Quantity
                        </label>
                        <input
                          type="number"
                          name="getQuantity"
                          id="getQuantity"
                          min="1"
                          value={formData.getQuantity || 1}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${errors.getQuantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                        />
                        {errors.getQuantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.getQuantity}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                  >
                    {isLoading ? 'Creating...' : 'Create Coupon'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCouponModal;