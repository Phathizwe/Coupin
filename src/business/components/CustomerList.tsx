import React, { useState, useEffect } from 'react';
import { customerDashboardService, BusinessCustomerSummary, CustomerStats } from '../services/customerDashboardService';
import { useAuth } from '../../hooks/useAuth';

export const CustomerList: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<BusinessCustomerSummary[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<BusinessCustomerSummary[]>([]);

  useEffect(() => {
    loadCustomerData();
  }, [user]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadCustomerData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [customerData, statsData] = await Promise.all([
        customerDashboardService.getBusinessCustomers(user.uid),
        customerDashboardService.getCustomerStats(user.uid)
      ]);
      setCustomers(customerData);
      setStats(statsData);
      if (customerData.length === 0) {
        setError('No customers found. Customers will appear here when they join your loyalty programs.');
      }
    } catch (err) {
      setError('Failed to load customer data. Please try again.');
      console.error('Customer data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm.replace(/\s+/g, ''))
    );
    setFilteredCustomers(filtered);
  };

  const getVisitFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'vip': return 'gold';
      case 'regular': return 'green';
      case 'occasional': return 'blue';
      default: return 'gray';
    }
  };

  const formatLastVisit = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="customer-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your customer community...</p>
      </div>
    );
  }

  return (
    <div className="customer-list">
      {/* Customer Statistics */}
      {stats && (
        <div className="customer-stats">
          <div className="stat-card">
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
          <div className="stat-card">
            <h3>{stats.newThisMonth}</h3>
            <p>New This Month</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalVisits}</h3>
            <p>Total Visits</p>
          </div>
          <div className="stat-card">
            <h3>R{stats.averageSpendPerCustomer.toFixed(2)}</h3>
            <p>Avg. Spend</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="customer-search">
        <input
          type="text"
          placeholder="Find someone in your community..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="customer-error">
          <p>{error}</p>
          <button onClick={loadCustomerData} className="retry-button">
            Refresh
          </button>
        </div>
      )}

      {/* Customer List */}
      {filteredCustomers.length > 0 ? (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div className="customer-header">
                <h3>{customer.name}</h3>
                <span 
                  className="frequency-badge"
                  style={{ backgroundColor: getVisitFrequencyColor(customer.visitFrequency) }}
                >
                  {customer.visitFrequency.toUpperCase()}
                </span>
              </div>
              <div className="customer-contact">
                <p>{customer.phone}</p>
                <p>{customer.email}</p>
              </div>
              <div className="customer-stats">
                <div className="stat">
                  <span className="stat-value">{customer.totalVisits}</span>
                  <span className="stat-label">Visits</span>
                </div>
                <div className="stat">
                  <span className="stat-value">R{customer.totalSpent.toFixed(2)}</span>
                  <span className="stat-label">Spent</span>
                </div>
              </div>
              <div className="customer-programs">
                <h4>Loyalty Programs ({customer.enrolledPrograms.length})</h4>
                {customer.enrolledPrograms.map((program) => (
                  <div key={program.programId} className="program-badge">
                    <span className="program-name">{program.programName}</span>
                    <span className="program-progress">
                      {program.programType === 'points' && `${program.currentPoints} pts`}
                      {program.programType === 'visits' && `${program.currentVisits} visits`}
                      {program.programType === 'cashback' && `R${program.totalSpent.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="customer-footer">
                <span className="last-visit">
                  Last visit: {formatLastVisit(customer.lastVisit)}
                </span>
                <button className="record-visit-btn">
                  Record Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="no-customers">
            <div className="empty-state">
              <h3>No customers found</h3>
              <p>
                {searchTerm 
                  ? `No customers match "${searchTerm}". Try a different search term.`
                  : 'Your customer community is growing! Customers will appear here when they join your loyalty programs.'
                }
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};