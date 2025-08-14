import React from 'react';
import { QRScanner } from '../components/QRScanner';

export const ScanPage: React.FC = () => {
  return (
    <div className="scan-page">
      <div className="page-header">
        <h1>Welcome Back Your Loyal Customers</h1>
        <p>Scan customer QR codes to record visits and award loyalty points</p>
      </div>
      <QRScanner />
    </div>
  );
};