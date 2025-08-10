import React, { useState } from 'react';
import { LoyaltyProgram, LoyaltyTier } from '../../types';

interface CreateLoyaltyProgramFormProps {
  onSave: (programData: Partial<LoyaltyProgram>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<LoyaltyProgram>;
  loading?: boolean; // For new code
  isSubmitting?: boolean; // For backward compatibility with existing code
}

const CreateLoyaltyProgramForm: React.FC<CreateLoyaltyProgramFormProps> = ({
  onSave,
  onCancel,
  initialData,
  loading = false,
  isSubmitting = false // Support both prop names
}) => {
  const [formData, setFormData] = useState<Partial<LoyaltyProgram>>(
    initialData || {
      name: '',
      description: '',
      type: 'points',
      pointsPerAmount: 10,
      amountPerPoint: 0.1,
      visitsRequired: 10,
      tiers: [],
      active: false
    }
  );
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use either prop or local state for loading
  const isLoading = loading || isSubmitting || localLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'pointsPerAmount' || name === 'amountPerPoint' || name === 'visitsRequired') {
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
    setLocalLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
    } catch (err) {
      setError('Failed to save loyalty program. Please try again.');
      console.error('Error saving loyalty program:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Loyalty Program' : 'Create New Loyalty Program'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Program Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Points Rewards Program"
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
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe your loyalty program"
        />
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Program Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="points">Points-based</option>
          <option value="visits">Visit-based</option>
          <option value="tiered">Tiered</option>
        </select>
      </div>
      
      {formData.type === 'points' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pointsPerAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Points Per $1 Spent
            </label>
            <input
              type="number"
              id="pointsPerAmount"
              name="pointsPerAmount"
              value={formData.pointsPerAmount}
              onChange={handleChange}
              min="0"
              step="0.1"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="amountPerPoint" className="block text-sm font-medium text-gray-700 mb-1">
              Value Per Point ($)
            </label>
            <input
              type="number"
              id="amountPerPoint"
              name="amountPerPoint"
              value={formData.amountPerPoint}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}
      
      {formData.type === 'visits' && (
        <div>
          <label htmlFor="visitsRequired" className="block text-sm font-medium text-gray-700 mb-1">
            Visits Required for Reward
          </label>
          <input
            type="number"
            id="visitsRequired"
            name="visitsRequired"
            value={formData.visitsRequired}
            onChange={handleChange}
            min="1"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      )}
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleCheckboxChange}
          disabled={isLoading}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Activate program immediately
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Program'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateLoyaltyProgramForm;