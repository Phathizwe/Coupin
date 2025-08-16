/**
 * Component to display loyalty programs the customer has access to
 * through business relationships
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoyaltyProgram, getCustomerPrograms } from '../../services/customerProgramService';

interface AccessibleLoyaltyProgramsProps {
  businessId?: string; // Optional: filter by business ID
  onProgramSelect?: (program: LoyaltyProgram) => void;
}

const AccessibleLoyaltyPrograms: React.FC<AccessibleLoyaltyProgramsProps> = ({ 
  businessId,
  onProgramSelect 
}) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoyaltyPrograms();
    }
  }, [user, businessId]);

  const loadLoyaltyPrograms = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allPrograms = await getCustomerPrograms(user.uid);
      
      // Filter by business ID if provided
      const filteredPrograms = businessId
        ? allPrograms.filter(program => program.businessId === businessId)
        : allPrograms;
      
      setPrograms(filteredPrograms);
    } catch (err) {
      console.error('Error loading loyalty programs:', err);
      setError('Failed to load your loyalty programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={loadLoyaltyPrograms}
          className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-sm">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No loyalty programs</h3>
        <p className="mt-1 text-sm text-gray-500">
          {businessId 
            ? "This business doesn't have any active loyalty programs yet."
            : "You don't have access to any loyalty programs yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div 
          key={program.id} 
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                {program.businessName && (
                  <p className="text-sm text-gray-500">{program.businessName}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                program.type === 'points' ? 'bg-blue-100 text-blue-800' :
                program.type === 'visits' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {program.type === 'points' ? 'Points' :
                 program.type === 'visits' ? 'Visits' : 'Tiered'}
              </span>
            </div>
            
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{program.description}</p>
            
            <div className="mt-3">
              {program.type === 'points' && program.pointsPerAmount && (
                <p className="text-sm text-gray-600">
                  Earn 1 point for every R{program.pointsPerAmount.toFixed(2)} spent
                </p>
              )}
              {program.type === 'visits' && program.visitsRequired && (
                <p className="text-sm text-gray-600">
                  {program.visitsRequired} visits required for a reward
                </p>
              )}
              {program.type === 'tiered' && program.tiers && program.tiers.length > 0 && (
                <p className="text-sm text-gray-600">
                  {program.tiers.length} tiers available
                </p>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  {program.rewards.length} {program.rewards.length === 1 ? 'reward' : 'rewards'} available
                </span>
              </div>
              
              <Link
                to={`/customer/loyalty/${program.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => onProgramSelect?.(program)}
              >
                View Program
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccessibleLoyaltyPrograms;