import React, { useState, useEffect } from 'react';
import { qrCodeService } from '../services/qrCodeService';
import { CustomerProgram } from '../services/enrollmentService';

interface QRCodeDisplayProps {
  program: CustomerProgram;
  onClose?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ program, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [program]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qrCode = await qrCodeService.generateLoyaltyQR(
        program.customerId,
        program.programId,
        program.businessId,
        program.customerPhone
      );
      setQrCodeDataURL(qrCode);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="qr-code-modal">
      <div className="qr-code-content">
        <div className="qr-header">
          <h3>Your Loyalty QR Code</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="program-info">
          <h4>{program.programName}</h4>
          <p>{program.businessName}</p>
        </div>
        {isLoading && (
          <div className="qr-loading">
            Generating QR code...
          </div>
        )}
        {error && (
          <div className="qr-error">
            {error}
            <button onClick={generateQRCode} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        {qrCodeDataURL && (
          <div className="qr-code-container">
            <img src={qrCodeDataURL} alt="Loyalty QR Code" className="qr-code-image" />
            <p className="qr-instructions">
              Show this QR code to the store staff to record your visit
            </p>
          </div>
        )}
      </div>
    </div>
  );
};