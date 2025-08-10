import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreOptionsButton from './MoreOptionsButton';

interface ScannerViewProps {
  onCodeScanned: (code: string) => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onCodeScanned }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        // In a real app, you'd use a QR code scanning library like jsQR or a React wrapper
        // This is a simplified mock implementation
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          // Mock QR code detection - in a real app, you'd process video frames
          // For demo purposes, let's simulate a scan after 3 seconds
          if (process.env.NODE_ENV === 'development') {
            scannerRef.current = setTimeout(() => {
              // Simulate finding a QR code with a coupon code
              onCodeScanned('TESTCOUPON123');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    
    initScanner();
    
    return () => {
      // Clean up
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (scannerRef.current) {
        clearTimeout(scannerRef.current);
      }
    };
  }, [onCodeScanned]);

  return (
    <div className="flex-1 relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* Scanner overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 border-4 border-white rounded-lg relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-6 text-center text-white text-lg">
        Position the QR code in the center
      </div>
      
      {/* More options button */}
      <div className="absolute bottom-6 inset-x-0 text-center">
        <button 
          onClick={() => navigate('/business/dashboard')}
          className="text-sm text-white hover:text-blue-300"
        >
          More options
        </button>
      </div>
    </div>
  );
};

export default ScannerView;