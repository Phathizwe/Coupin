import React, { useState } from 'react';
import { LoyaltyProgram, LoyaltyTier } from '../../types';

interface CreateLoyaltyProgramModalProps {
  initialData?: LoyaltyProgram;
  businessId: string; // Add businessId prop
  onSave: (program: LoyaltyProgram) => void;
  onCancel: () => void;
}

const EmotionalCreateLoyaltyModal: React.FC<CreateLoyaltyProgramModalProps> = ({
  initialData,
  businessId, // Add businessId parameter
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<LoyaltyProgram>>(
    initialData || {
      name: '',
      description: '',
      type: 'points',
      pointsPerAmount: 1,
      amountPerPoint: 1,
      visitsRequired: 10,
      tiers: [],
      rewards: [],
      active: false
    }
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [animateIn, setAnimateIn] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a complete program object
    const completeProgram: LoyaltyProgram = {
      id: initialData?.id || `loyalty_${Date.now()}`,
      businessId: businessId, // Use the passed businessId instead of hardcoded value
      name: formData.name || 'Loyalty Program',
      description: formData.description || 'Our loyalty program',
      type: formData.type || 'points',
      pointsPerAmount: formData.pointsPerAmount || 1,
      amountPerPoint: formData.amountPerPoint || 1,
      visitsRequired: formData.visitsRequired || 10,
      tiers: formData.tiers || [],
      rewards: initialData?.rewards || [],
      active: formData.active || false,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(completeProgram);
  };

  const nextStep = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setAnimateIn(true);
    }, 300);
  };

  const prevStep = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setAnimateIn(true);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-900">
              {initialData ? 'Edit Loyalty Program' : 'Create Loyalty Program'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex mb-8">
            <div className="flex-1">
              <div className={`h-1 ${currentStep >= 1 ? 'bg-purple-600' : 'bg-gray-200'} transition-colors duration-500`}></div>
              <div className="flex items-center mt-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Basic Info</span>
              </div>
            </div>
            <div className="flex-1">
              <div className={`h-1 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'} transition-colors duration-500`}></div>
              <div className="flex items-center mt-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Program Type</span>
              </div>
            </div>
            <div className="flex-1">
              <div className={`h-1 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-gray-200'} transition-colors duration-500`}></div>
              <div className="flex items-center mt-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Review</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className={`space-y-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., VIP Rewards Club"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Describe your loyalty program..."
                    rows={3}
                    required
                  />
                </div>

                <div className="pt-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md flex items-center"
                    >
                      Next
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Program Type */}
            {currentStep === 2 && (
              <div className={`space-y-6 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Program Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${formData.type === 'points' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'points' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border ${formData.type === 'points' ? 'border-purple-500' : 'border-gray-300'
                          } flex items-center justify-center`}>
                          {formData.type === 'points' && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                        <span className="ml-2 font-medium">Points</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customers earn points based on purchase amount
                      </p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${formData.type === 'visits' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'visits' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border ${formData.type === 'visits' ? 'border-purple-500' : 'border-gray-300'
                          } flex items-center justify-center`}>
                          {formData.type === 'visits' && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                        <span className="ml-2 font-medium">Visits</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customers earn rewards based on number of visits
                      </p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${formData.type === 'tiered' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: 'tiered' }))}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border ${formData.type === 'tiered' ? 'border-purple-500' : 'border-gray-300'
                          } flex items-center justify-center`}>
                          {formData.type === 'tiered' && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                        <span className="ml-2 font-medium">Tiered</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Customers progress through different loyalty tiers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points Settings */}
                {formData.type === 'points' && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-purple-800 mb-3">Points Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points Per Amount
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="pointsPerAmount"
                            value={formData.pointsPerAmount || 1}
                            onChange={handleNumberChange}
                            min="0.1"
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">points per R1</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount Per Point (Redemption)
                        </label>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm text-gray-600">R</span>
                          <input
                            type="number"
                            name="amountPerPoint"
                            value={formData.amountPerPoint || 1}
                            onChange={handleNumberChange}
                            min="0.1"
                            step="0.1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">per point</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visits Settings */}
                {formData.type === 'visits' && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-purple-800 mb-3">Visits Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visits Required for Reward
                      </label>
                      <input
                        type="number"
                        name="visitsRequired"
                        value={formData.visitsRequired || 10}
                        onChange={handleNumberChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Tiered Settings */}
                {formData.type === 'tiered' && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-purple-800 mb-3">Tiered Settings</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You'll be able to configure tiers after creating the program.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md flex items-center"
                  >
                    Next
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className={`space-y-6 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium text-purple-800 mb-3">Program Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{formData.type}</span>
                    </div>
                    {formData.type === 'points' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Points Per R1:</span>
                          <span className="text-sm text-gray-900">{formData.pointsPerAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Value Per Point:</span>
                          <span className="text-sm text-gray-900">R{formData.amountPerPoint}</span>
                        </div>
                      </>
                    )}
                    {formData.type === 'visits' && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Visits Required:</span>
                        <span className="text-sm text-gray-900">{formData.visitsRequired}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active || false}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Activate program immediately
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md flex items-center"
                  >
                    {initialData ? 'Save Changes' : 'Create Program'}
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmotionalCreateLoyaltyModal;