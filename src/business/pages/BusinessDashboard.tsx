import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { customerDashboardService } from '../services/customerDashboardService';

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalVisits: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const customerStats = await customerDashboardService.getCustomerStats(user.uid);
        setStats({
          totalCustomers: customerStats.totalCustomers,
          activeCustomers: customerStats.activeCustomers,
          newThisMonth: customerStats.newThisMonth,
          totalVisits: customerStats.totalVisits,
          totalRevenue: customerStats.totalRevenue
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <div className="business-dashboard">
      <div className="page-header">
        <h1>Welcome to Your Business Dashboard</h1>
        <p>Track your loyalty program performance and customer engagement</p>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard data...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalCustomers}</h3>
              <p>Total Customers</p>
            </div>
            <div className="stat-card">
              <h3>{stats.activeCustomers}</h3>
              <p>Active Customers</p>
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
              <h3>R{stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <a href="/business/scan" className="action-button">
                <span className="icon">📱</span>
                <span className="label">Scan Customer</span>
              </a>
              <a href="/business/customers" className="action-button">
                <span className="icon">👥</span>
                <span className="label">View Customers</span>
              </a>
              <a href="/business/loyalty" className="action-button">
                <span className="icon">⭐</span>
                <span className="label">Manage Loyalty</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};