import React, { useState } from 'react';
import { LoyaltyProgram } from '../../types';
import CreateLoyaltyProgramForm from './CreateLoyaltyProgramForm';
import { saveLoyaltyProgram } from '../../services/loyalty/programService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

interface CreateLoyaltyProgramModalProps {
  initialData?: LoyaltyProgram;
  onSave: (program: LoyaltyProgram) => void;
  onCancel: () => void;
}

const CreateLoyaltyProgramModal: React.FC<CreateLoyaltyProgramModalProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProgram = async (programData: Partial<LoyaltyProgram>) => {
    if (!user?.businessId) {
      setError("Missing business ID. Please refresh the page or contact support.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Creating loyalty program with business ID:', user.businessId);
      
      // Create a new program object with required fields
      const newProgramData = {
        businessId: user.businessId,
        name: programData.name || 'Default Loyalty Program',
        description: programData.description || 'Reward your loyal customers',
        type: programData.type || 'points',
        pointsPerAmount: programData.pointsPerAmount,
        amountPerPoint: programData.amountPerPoint,
        visitsRequired: programData.visitsRequired,
        tiers: programData.tiers || [],
        rewards: [],
        active: programData.active !== undefined ? programData.active : true
  };

      console.log('Saving loyalty program with data:', newProgramData);
      const newProgram = await saveLoyaltyProgram(newProgramData);
      console.log('Loyalty program created successfully:', newProgram);
      toast.success('Loyalty program created successfully!');
      onSave(newProgram);
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      let errorMessage = 'An unexpected error occurred while creating the loyalty program.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
    }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
      </div>
        )}
        
        <CreateLoyaltyProgramForm
          onSave={handleCreateProgram}
          onCancel={onCancel}
          initialData={initialData}
          isSubmitting={isSubmitting}
        />
    </div>
    </div>
  );
};

export default CreateLoyaltyProgramModal;
