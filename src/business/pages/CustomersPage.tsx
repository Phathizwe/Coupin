import React from 'react';
import { CustomerList } from '../components/CustomerList';

export const CustomersPage: React.FC = () => {
  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Your Customer Community</h1>
        <p>Manage relationships and track loyalty program engagement</p>
      </div>
      <CustomerList />
    </div>
  );
};