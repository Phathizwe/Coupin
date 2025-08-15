import React from 'react';
import EnhancedCustomerManagement from '../components/EnhancedCustomerManagement';

/**
 * Enhanced Customer Management Page
 * This page integrates the enhanced customer management component
 * It addresses the critical customer visibility and phone lookup issues
 */
const EnhancedCustomerManagementPage: React.FC = () => {
  return (
    <div className="enhanced-customer-management-page">
      <EnhancedCustomerManagement />
    </div>
  );
};

export default EnhancedCustomerManagementPage;