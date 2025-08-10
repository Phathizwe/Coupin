import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
const LoyaltyProgramFixer: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [businessId, setBusinessId] = useState(user?.businessId || 'FDO1T2TrcWcglFBm4w68');
  const [environment, setEnvironment] = useState('');
  const [existingPrograms, setExistingPrograms] = useState<any[]>([]);

  // Check environment on load
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // This will help determine which Firestore instance we're connected to
        const envInfo = {
          host: window.location.host,
          dbHost: (db as any)._databaseId?.projectId || 'unknown',
          emulator: !!(db as any)._settings?.host?.includes('localhost')
        };
        setEnvironment(JSON.stringify(envInfo, null, 2));

        // Try to fetch any existing programs
        await checkExistingPrograms();
    } catch (error) {
        console.error('Error checking environment:', error);
    }
  };

    checkEnvironment();
  }, []);
  const checkExistingPrograms = async () => {
    try {
      setLoading(true);
      
      // Check both by business ID and all programs
      const byBusinessQuery = query(
        collection(db, 'loyaltyPrograms'),
        where('businessId', '==', businessId)
      );
      
      const allQuery = query(collection(db, 'loyaltyPrograms'));
      
      const [byBusinessSnapshot, allSnapshot] = await Promise.all([
        getDocs(byBusinessQuery),
        getDocs(allQuery)
      ]);
      
      const businessPrograms = byBusinessSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        matchesCurrentBusiness: true
      }));
      
      const allPrograms = allSnapshot.docs
        .filter(doc => !businessPrograms.some(p => p.id === doc.id))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          matchesCurrentBusiness: false
        }));
      
      setExistingPrograms([...businessPrograms, ...allPrograms]);
      return {
        byBusinessCount: byBusinessSnapshot.docs.length,
        totalCount: allSnapshot.docs.length
};
    } catch (error) {
      console.error('Error checking existing programs:', error);
      return { byBusinessCount: 0, totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async () => {
    setLoading(true);
    try {
      // Generate a unique ID for the program
      const programId = `loyalty_${Date.now()}`;
      const programRef = doc(db, 'loyaltyPrograms', programId);
      
      // Create program data
      const programData = {
        businessId,
        name: 'Customer Rewards Program',
        description: 'Earn points with every purchase and redeem for rewards',
        type: 'points',
        pointsPerAmount: 10,
        amountPerPoint: 0.1,
        active: true,
        tiers: [],
        rewards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Attempt to write directly to Firestore
      await setDoc(programRef, programData);
      
      // Verify the write was successful
      const verifyDoc = await getDoc(programRef);
      
      if (verifyDoc.exists()) {
        setResult({
          success: true,
          message: 'Loyalty program created successfully!',
          programId,
          data: programData
        });
        
        // Refresh the list of existing programs
        await checkExistingPrograms();
      } else {
        setResult({
          success: false,
          message: 'Program document was not found after creation attempt',
          programId
        });
      }
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      setResult({
        success: false,
        message: 'Failed to create loyalty program',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Loyalty Program Fixer</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Information</h2>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
          {environment}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Business ID</h2>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded flex-1"
          />
          <button
            onClick={checkExistingPrograms}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Existing Programs ({existingPrograms.length})</h2>
        {existingPrograms.length === 0 ? (
          <p className="text-gray-500">No loyalty programs found in the database.</p>
        ) : (
          <div className="overflow-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {existingPrograms.map((program) => (
                  <tr key={program.id} className={program.matchesCurrentBusiness ? "bg-green-50" : ""}>
                    <td className="px-3 py-2 text-sm text-gray-900">{program.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{program.name || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{program.businessId || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{program.type || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{program.active ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Create New Program</h2>
        <button
          onClick={createProgram}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {loading ? 'Creating...' : 'Create Loyalty Program'}
        </button>
      </div>
      
      {result && (
        <div className={`bg-white rounded-lg shadow p-4 mb-6 border-l-4 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <p className={`mb-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.message}
          </p>
          {result.programId && (
            <p className="text-sm mb-2">Program ID: {result.programId}</p>
          )}
          {result.error && (
            <p className="text-sm text-red-500 mb-2">Error: {result.error}</p>
          )}
          {result.data && (
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-1">Program Data:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgramFixer;