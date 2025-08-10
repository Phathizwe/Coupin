import React, { useState } from 'react';
import { diagnoseLoyaltyProgramIssue, createDirectLoyaltyProgram } from '../../utils/loyaltyDiagnostics';
import { useAuth } from '../../hooks/useAuth';

const LoyaltyDiagnosticTool: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [businessId, setBusinessId] = useState(user?.businessId || 'FDO1T2TrcWcglFBm4w68');

  const handleRunDiagnostic = async () => {
    setLoading(true);
    try {
      const diagnosticResult = await diagnoseLoyaltyProgramIssue(businessId);
      setResult(diagnosticResult);
    } catch (error) {
      setResult({
        success: false,
        error: 'Unhandled error',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDirect = async () => {
    setLoading(true);
    try {
      const creationResult = await createDirectLoyaltyProgram(businessId);
      setResult(creationResult);
    } catch (error) {
      setResult({
        success: false,
        error: 'Unhandled error',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Loyalty Program Diagnostic Tool</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Business ID Configuration</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Business ID</label>
          <input
            type="text"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-sm text-gray-500">
            {user?.businessId 
              ? `Using your authenticated business ID: ${user.businessId}` 
              : 'Using default business ID from the form'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostic Actions</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <button
            onClick={handleRunDiagnostic}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Running...' : 'Run Diagnostic'}
          </button>
          
          <button
            onClick={handleCreateDirect}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Creating...' : 'Create Program Directly'}
          </button>
        </div>
      </div>
      
      {result && (
        <div className={`p-4 rounded-md mb-6 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="font-medium mb-2">{result.success ? 'Success' : 'Error'}</h3>
          <p className="mb-2">{result.message || result.error}</p>
          {result.details && <p className="text-sm text-gray-700">{result.details}</p>}
          {result.programId && <p className="font-medium mt-2">Program ID: {result.programId}</p>}
          {result.existingPrograms !== undefined && (
            <p className="mt-2">Found {result.existingPrograms} existing loyalty programs in the database.</p>
          )}
          {result.testDocumentId && (
            <p className="mt-2">Created test document with ID: {result.testDocumentId}</p>
          )}
          <pre className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDiagnosticTool;