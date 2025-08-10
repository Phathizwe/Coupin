import React from 'react';
import SimpleDashboard from './dashboard/SimpleDashboard';

// This file exists to fix build errors where something is importing from 'src/components/dashboard.tsx'
// The actual dashboard components are in the dashboard/ directory

// Re-export SimpleDashboard as both default and named export
export { SimpleDashboard };
export default SimpleDashboard;