import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { debugCoupons } from '../../services/couponService';

const BusinessCouponDebugger: React.FC = () => {
  const { user, businessProfile } = useAuth();
  const [debugResult, setDebugResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const runDebug = async () => {
    setLoading(true);
    setError(null);
    try {
      const businessId = user?.businessId || businessProfile?.businessId;
      if (!businessId) {
        throw new Error('No business ID available');
      }
      
      const result = await debugCoupons(businessId);
      setDebugResult(result);
    } catch (err) {
      console.error('Debug error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">Coupon Debugger</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Current User:</h4>
        <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-32">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Business Profile:</h4>
        <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-32">
          {JSON.stringify(businessProfile, null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={runDebug}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Debug'}
        </button>
        
        <button 
          onClick={() => {
            // Force reload the page
            window.location.reload();
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Refresh Page
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-2 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {debugResult && (
        <div className="mb-4">
          <h4 className="font-semibold">Debug Results:</h4>
          <div className="bg-white border border-gray-200 p-2 rounded">
            <p><strong>Total Coupons:</strong> {debugResult.summary.totalCoupons}</p>
            <p><strong>Total Distributions:</strong> {debugResult.summary.totalDistributions}</p>
            <p><strong>Total Customer Coupons:</strong> {debugResult.summary.totalCustomerCoupons}</p>
            <p><strong>Unique Coupon IDs:</strong> {Array.isArray(debugResult.summary.uniqueCouponIds) ? debugResult.summary.uniqueCouponIds.length : '0'}</p>
          </div>
          
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600">View Raw Debug Data</summary>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-64 mt-2">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default BusinessCouponDebugger;