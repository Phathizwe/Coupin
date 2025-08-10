import React from 'react';
import QRCodePage from './QRCodePage';

/**
 * QR Code page component
 * This is a simple wrapper around the refactored QRCodePage component
 * to maintain backward compatibility with existing routes
 */
const QRCode: React.FC = () => {
  return <QRCodePage />;
};

export default QRCode;