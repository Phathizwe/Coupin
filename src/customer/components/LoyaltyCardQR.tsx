import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeData {
  customerId: string;
  programId: string;
  businessId: string;
  timestamp: number;
}

interface CustomerProgram {
  id: string;
  customerId: string;
  businessId: string;
  programId: string;
  status: string;
  progress: {
    visits: number;
    points: number;
  };
}

interface LoyaltyCardQRProps {
  program: CustomerProgram;
}

const LoyaltyCardQR: React.FC<LoyaltyCardQRProps> = ({ program }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData: QRCodeData = {
          customerId: program.customerId,
          programId: program.programId,
          businessId: program.businessId,
          timestamp: Date.now()
        };

        const qrString = JSON.stringify(qrData);
        const qrUrl = await QRCode.toDataURL(qrString);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();

    // Refresh QR code every 30 seconds for security
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [program, refreshKey]);

  if (!qrCodeUrl) {
    return (
      <div className="qr-code-container flex items-center justify-center h-40 w-40 bg-gray-100 rounded-lg">
        <div className="animate-pulse text-gray-500">Loading QR...</div>
      </div>
    );
  }

  return (
    <div className="qr-code-container">
      <div className="flex flex-col items-center">
        <img 
          src={qrCodeUrl} 
          alt="Loyalty Card QR Code" 
          className="h-40 w-40 rounded-lg shadow-md"
        />
        <div className="mt-2 text-xs text-gray-500">
          Show this QR code to earn points
        </div>
        <div className="mt-1 text-xs text-gray-400">
          QR code refreshes every 30 seconds
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCardQR;