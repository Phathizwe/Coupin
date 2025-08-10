import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface StoreQRCodeGeneratorProps {
  businessId?: string;
  showInstructions?: boolean;
}

/**
 * Generates a QR code that businesses can display in their stores
 * When customers scan this code, they'll be taken to the simplified store dashboard
 */
const StoreQRCodeGenerator: React.FC<StoreQRCodeGeneratorProps> = ({ 
  businessId, 
  showInstructions = true 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');
  const [businessColors, setBusinessColors] = useState({
    primary: '#3B82F6',
    secondary: '#10B981'
  });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Generate the URL for the simplified store dashboard
  const getStoreURL = () => {
    // Base URL for the simplified store dashboard
    let url = `${window.location.origin}/store`;
    
    // Add business ID as a parameter if available
    if (businessId) {
      url += `?businessId=${businessId}`;
    }
    
    return url;
  };
  
  // Generate QR code using the Google Charts API
  useEffect(() => {
    const generateQRCode = () => {
      const storeUrl = getStoreURL();
      const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(storeUrl)}&choe=UTF-8`;
      setQrCodeUrl(googleChartsUrl);
    };
    
    generateQRCode();
  }, [businessId]);
  
  // Fetch business details
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // If businessId is provided, use it; otherwise use the logged-in business
        const id = businessId || user.uid;
        
        const businessDoc = await getDoc(doc(db, 'businesses', id));
        if (businessDoc.exists()) {
          const data = businessDoc.data();
          setBusinessName(data.businessName || 'Your Business');
          setBusinessLogo(data.logo || '');
          if (data.colors) {
            setBusinessColors(data.colors);
          }
        }
      } catch (error) {
        console.error('Error fetching business details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessDetails();
  }, [user, businessId]);
  
  // Download QR code as PNG
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-store-qr.png`;
    link.href = qrCodeUrl;
    link.click();
  };
  
  // Print QR code
  const printQRCode = () => {
    const printContent = document.getElementById('qr-code-container');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime().toString();
    
    const windowOptions = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=700';
    const printWindow = window.open(windowUrl, uniqueName, windowOptions);
    
    printWindow?.document.write('<html><head><title>Store QR Code</title>');
    printWindow?.document.write('<style>');
    printWindow?.document.write(`
      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
      .qr-container { margin: 20px auto; max-width: 300px; }
      .business-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      .instructions { font-size: 16px; margin-top: 20px; color: #555; }
    `);
    printWindow?.document.write('</style>');
    printWindow?.document.write('</head><body>');
    
    if (printContent) {
      printWindow?.document.write(printContent.innerHTML);
    }
    
    printWindow?.document.write('</body></html>');
    printWindow?.document.close();
    
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 500);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-40 h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div 
        className="px-6 py-4 border-b"
        style={{ borderColor: `${businessColors.primary}40` }}
      >
        <h2 className="text-lg font-medium" style={{ color: businessColors.primary }}>
          Store QR Code
        </h2>
      </div>
      
      <div className="p-6" id="qr-code-container">
        <div className="flex flex-col items-center mb-6">
          {businessLogo && (
            <img 
              src={businessLogo} 
              alt={businessName} 
              className="w-16 h-16 rounded-full object-cover mb-3"
            />
          )}
          <div className="business-name text-xl font-semibold text-gray-800 mb-1">
            {businessName}
          </div>
          <div className="text-sm text-gray-500">
            Scan to access coupons & loyalty
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <div 
            className="p-4 bg-white rounded-lg shadow-sm border"
            style={{ borderColor: `${businessColors.primary}30` }}
            ref={qrCodeRef}
          >
            <img 
              src={qrCodeUrl} 
              alt="Store QR Code"
              className="w-full h-auto"
            />
          </div>
        </div>
        
        {showInstructions && (
          <div className="instructions bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
            <p className="font-medium mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Print this QR code and display it in your store</li>
              <li>Customers can scan it with their phone camera</li>
              <li>They'll see a simplified dashboard for quick access to coupons and loyalty cards</li>
            </ol>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
        <button
          onClick={downloadQRCode}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Download
        </button>
        <button
          onClick={printQRCode}
          className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white text-sm font-medium hover:bg-indigo-700"
          style={{ backgroundColor: businessColors.primary }}
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default StoreQRCodeGenerator;