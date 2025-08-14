import React, { useState } from 'react';
import { BusinessSearchResult } from '../services/storeDiscoveryService';
import { enrollmentService } from '../services/enrollmentService';
import { useAuth } from '../../hooks/useAuth'; // Fixed import path

interface BusinessDetailProps {
  business: BusinessSearchResult;
  onEnrollmentSuccess?: () => void;
}

export const BusinessDetail: React.FC<BusinessDetailProps> = ({ 
  business, 
  onEnrollmentSuccess 
}) => {
  const { user } = useAuth();
  const [enrollingPrograms, setEnrollingPrograms] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleEnrollment = async (programId: string) => {
    if (!user) {
      setError('Please log in to join loyalty programs');
      return;
    }
    setEnrollingPrograms(prev => new Set(prev).add(programId));
    setError(null);
    try {
      await enrollmentService.enrollInProgram(
        user.uid,
        {
          phone: user.phoneNumber || '',
          email: user.email || '',
          name: user.displayName || ''
        },
        business.id,
        programId
      );
      onEnrollmentSuccess?.();
    } catch (err) {
      setError('Failed to join loyalty program. Please try again.');
      console.error('Enrollment error:', err);
    } finally {
      setEnrollingPrograms(prev => {
        const newSet = new Set(prev);
        newSet.delete(programId);
        return newSet;
      });
    }
  };

  return (
    <div className="business-detail">
      <h2>{business.businessName}</h2>
      {business.description && <p>{business.description}</p>}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="loyalty-programs">
        <h3>Available Loyalty Programs</h3>
        {business.loyaltyPrograms.map((program) => (
          <div key={program.id} className="program-card">
            <h4>{program.name}</h4>
            <p>{program.description}</p>
            <span className="program-type">{program.type} program</span>
            <button
              onClick={() => handleEnrollment(program.id)}
              disabled={enrollingPrograms.has(program.id)}
              className="enroll-button"
            >
              {enrollingPrograms.has(program.id) ? 'Joining...' : 'Join Program'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};