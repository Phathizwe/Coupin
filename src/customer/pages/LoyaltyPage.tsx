import React, { useState, useEffect } from 'react';
import { enrollmentService, CustomerProgram } from '../services/enrollmentService';
import { useAuth } from '../../hooks/useAuth'; // Fixed import path

export const LoyaltyPage: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<CustomerProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerPrograms();
  }, [user]);

  const loadCustomerPrograms = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const customerPrograms = await enrollmentService.getCustomerPrograms(user.uid);
      setPrograms(customerPrograms);
    } catch (err) {
      setError('Failed to load loyalty programs');
      console.error('Error loading programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading your loyalty programs...</div>;
  }

  return (
    <div className="loyalty-page">
      <h1>My Loyalty Programs</h1>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {programs.length === 0 ? (
        <div className="no-programs">
          <h3>No Loyalty Programs Yet</h3>
          <p>You haven't joined any loyalty programs yet. Visit stores to start earning rewards!</p>
          <a href="/customer/stores" className="browse-stores-button">
            Browse Stores
          </a>
        </div>
      ) : (
        <div className="programs-list">
          {programs.map((program) => (
            <div key={program.id} className="program-card">
              <h3>{program.programName}</h3>
              <p className="business-name">{program.businessName}</p>
              <div className="program-stats">
                {program.programType === 'points' && (
                  <div className="stat">
                    <span className="stat-value">{program.currentPoints}</span>
                    <span className="stat-label">Points</span>
                  </div>
                )}
                {program.programType === 'visits' && (
                  <div className="stat">
                    <span className="stat-value">{program.currentVisits}</span>
                    <span className="stat-label">Visits</span>
                  </div>
                )}
                <div className="stat">
                  <span className="stat-value">R{program.totalSpent.toFixed(2)}</span>
                  <span className="stat-label">Total Spent</span>
                </div>
              </div>
              <button className="generate-qr-button">
                Generate QR Code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};