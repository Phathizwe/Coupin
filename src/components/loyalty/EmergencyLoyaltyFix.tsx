import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const EmergencyLoyaltyFix: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [programName, setProgramName] = useState('Customer Rewards');
  const [programType, setProgramType] = useState('points');

  const createEmergencyProgram = async () => {
    setLoading(true);
    try {
      const businessId = user?.businessId;
      if (!businessId) {
        throw new Error('No business ID available');
      }

      // Create a custom ID that's easy to recognize
      const programId = `emergency_${Date.now()}`;
      
      console.log('EMERGENCY: Creating program with ID:', programId);
      console.log('EMERGENCY: Business ID:', businessId);
      
      // Create the program document directly
      const programRef = doc(db, 'loyaltyPrograms', programId);
      
      // Basic program data - FIXED to avoid undefined values
      const programData = {
        businessId,
        name: programName,
        description: 'Created via emergency tool',
        type: programType,
        pointsPerAmount: programType === 'points' ? 10 : 0,
        amountPerPoint: programType === 'points' ? 0.1 : 0,
        visitsRequired: programType === 'visits' ? 10 : 0,
        active: true,
        tiers: [],
        rewards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('EMERGENCY: Program data:', programData);
      
      // Write directly to Firestore
      await setDoc(programRef, programData);
      console.log('EMERGENCY: Write operation completed');
      
      // Verify the write was successful
      const verifyDoc = await getDoc(programRef);
      if (verifyDoc.exists()) {
        console.log('EMERGENCY: Verification successful - document exists');
        setResult({
          success: true,
          message: 'Emergency program created successfully!',
          programId,
        });
      } else {
        console.error('EMERGENCY: Verification failed - document does not exist');
        throw new Error('Document verification failed');
      }
      
    } catch (error) {
      console.error('EMERGENCY: Operation failed:', error);
      setResult({
        success: false,
        message: 'Failed to create emergency program',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Emergency Fix Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-md shadow-lg hover:bg-red-700 flex items-center"
        >
          <span className="mr-2">🚨</span>
          Emergency: Create Loyalty Program
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Emergency Loyalty Program Creator</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Program Name</label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Program Type</label>
              <select
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="points">Points-based</option>
                <option value="visits">Visit-based</option>
                <option value="tiered">Tiered</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Business ID</label>
              <input
                type="text"
                value={user?.businessId || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              
              <button
                onClick={createEmergencyProgram}
                disabled={loading}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
              >
                {loading ? 'Creating...' : 'Create Emergency Program'}
              </button>
            </div>
            
            {result && (
              <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-medium">{result.message}</p>
                {result.programId && <p className="text-sm mt-1">Program ID: {result.programId}</p>}
                {result.error && <p className="text-sm mt-1">Error: {result.error}</p>}
                
                {result.success && (
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 w-full py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Reload Page to See Program
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyLoyaltyFix;