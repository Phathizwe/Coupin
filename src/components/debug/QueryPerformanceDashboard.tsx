// src/components/debug/QueryPerformanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';

const QueryPerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Refresh performance data
  const refreshData = () => {
    const summary = performanceMonitor.getPerformanceSummary();
    setPerformanceData(summary);
  };

  // Handle auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Clear all metrics
  const handleClearMetrics = () => {
    performanceMonitor.clearMetrics();
    refreshData();
  };

  if (!performanceData) {
    return <div>Loading performance data...</div>;
  }

  return (
    <div className="query-performance-dashboard">
      <div className="dashboard-header">
        <h2>Query Performance Dashboard</h2>
        <div className="dashboard-controls">
          <button onClick={refreshData} className="refresh-button">
            Refresh Data
          </button>
          <button onClick={handleClearMetrics} className="clear-button">
            Clear Metrics
          </button>
          <label className="auto-refresh-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (3s)
          </label>
        </div>
      </div>

      <div className="performance-summary">
        <div className="summary-card">
          <h3>Average Query Time</h3>
          <p className="metric-value">
            {performanceData.averageQueryTime.toFixed(2)} ms
          </p>
        </div>
        
        <div className="summary-card">
          <h3>Cache Hit Rate</h3>
          <p className="metric-value">
            {performanceData.cacheHitRate.toFixed(2)}%
          </p>
        </div>
        
        <div className="summary-card">
          <h3>Total Queries</h3>
          <p className="metric-value">{performanceData.totalQueries}</p>
        </div>
      </div>

      <div className="slow-queries-section">
        <h3>Slow Queries</h3>
        {performanceData.slowQueries.length > 0 ? (
          <table className="slow-queries-table">
            <thead>
              <tr>
                <th>Query Name</th>
                <th>Duration (ms)</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.slowQueries.map((query: any, index: number) => (
                <tr key={index}>
                  <td>{query.queryName}</td>
                  <td>{query.duration.toFixed(2)}</td>
                  <td>{new Date(query.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">No slow queries detected</p>
        )}
      </div>
    </div>
  );
};

export default QueryPerformanceDashboard;