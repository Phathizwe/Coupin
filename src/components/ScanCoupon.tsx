import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScannerLogic } from './scanner/useScannerLogic';
import { useCouponProcessing } from './scanner/useCouponProcessing';
import ScannerView from './scanner/ScannerView';
import CouponDetails from './scanner/CouponDetails';
import ErrorState from './scanner/ErrorState';
import LoadingState from './scanner/LoadingState';

const ScanCoupon: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  
  const {
    coupon,
    customer,
    isLoading,
    error,
    handleCodeScanned,
    handleRedeemCoupon,
    resetState
  } = useCouponProcessing();
  
  const handleScan = (code: string) => {
    setScanning(false);
    handleCodeScanned(code);
  };
  
  const { videoRef, canvasRef, cancelScanning } = useScannerLogic({
    scanning,
    onCodeScanned: handleScan
  });
  
  const handleReset = () => {
    resetState();
    setScanning(true);
  };
  
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="p-4 flex items-center z-10">
        <button 
          onClick={() => navigate('/')}
          className="text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white ml-4">Scan Coupon</h1>
      </header>
      
      {/* Scanner View */}
      {scanning && (
        <ScannerView videoRef={videoRef} canvasRef={canvasRef} />
      )}
      
      {/* Results View */}
      {!scanning && (
        <div className="flex-1 bg-white p-4 flex flex-col">
          {error ? (
            <ErrorState error={error} onReset={handleReset} />
          ) : isLoading ? (
            <LoadingState />
          ) : coupon && customer ? (
            <CouponDetails 
              coupon={coupon} 
              customer={customer} 
              isLoading={isLoading}
              onRedeem={handleRedeemCoupon}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ScanCoupon;