import React, { useState } from 'react';
import { LoyaltyReward } from '../../types';

interface LoyaltyRewardFormProps {
  onSave: (rewardData: Omit<LoyaltyReward, 'id'>) => Promise<void>;
  onCancel: () => void;
  programId: string;
  initialData?: Partial<LoyaltyReward>;
}

const LoyaltyRewardForm: React.FC<LoyaltyRewardFormProps> = ({
  onSave,
  onCancel,
  programId,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<LoyaltyReward>>(
    initialData || {
      name: '',
      description: '',
      pointsCost: 100,
      visitsCost: 5,
      type: 'discount',
      discountType: 'percentage',
      discountValue: 10,
      freeItem: '',
      customDescription: '',
      active: true
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'pointsCost' || name === 'visitsCost' || name === 'discountValue') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Add programId to the reward data
      const rewardData = {
        ...formData,
        programId,
        active: formData.active || false
      } as Omit<LoyaltyReward, 'id'>;
      
      await onSave(rewardData);
    } catch (err) {
      setError('Failed to save reward. Please try again.');
      console.error('Error saving loyalty reward:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Reward' : 'Add New Reward'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Reward Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., 10% Off Purchase"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe the reward"
        />
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Reward Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="discount">Discount</option>
          <option value="freeItem">Free Item</option>
          <option value="custom">Custom Reward</option>
        </select>
      </div>
      
      {formData.type === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type
            </label>
            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
            </label>
            <input
              type="number"
              id="discountValue"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              min="0"
              step={formData.discountType === 'percentage' ? '1' : '0.01'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}
      
      {formData.type === 'freeItem' && (
        <div>
          <label htmlFor="freeItem" className="block text-sm font-medium text-gray-700 mb-1">
            Free Item Description
          </label>
          <input
            type="text"
            id="freeItem"
            name="freeItem"
            value={formData.freeItem}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Free Coffee"
          />
        </div>
      )}
      
      {formData.type === 'custom' && (
        <div>
          <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Reward Description
          </label>
          <textarea
            id="customDescription"
            name="customDescription"
            value={formData.customDescription}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe the custom reward"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pointsCost" className="block text-sm font-medium text-gray-700 mb-1">
            Points Cost
          </label>
          <input
            type="number"
            id="pointsCost"
            name="pointsCost"
            value={formData.pointsCost}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="visitsCost" className="block text-sm font-medium text-gray-700 mb-1">
            Visits Required
          </label>
          <input
            type="number"
            id="visitsCost"
            name="visitsCost"
            value={formData.visitsCost}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Active
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Reward'}
        </button>
      </div>
    </form>
  );
};

export default LoyaltyRewardForm;