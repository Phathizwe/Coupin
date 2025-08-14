import React from 'react';
import { CustomerManagementList } from '../components/CustomerManagementList';

export const CustomerManagementPage: React.FC = () => {
  return (
    <div className="customer-management-page">
      <div className="page-header">
        <h1>Customer Management</h1>
        <p>View, search, and manage your customer relationships</p>
      </div>
      <CustomerManagementList />
    </div>
  );
};

export default CustomerManagementPage;