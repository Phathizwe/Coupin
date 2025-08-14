import React, { useState, useRef, useEffect } from 'react';
import { visitRecordingService, VisitRecordingResult } from '../services/visitRecordingService';
import { useAuth } from '../../hooks/useAuth';

export const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<VisitRecordingResult | null>(null);
  const [manualEntry, setManualEntry] = useState({
    customerPhone: '',
    programId: '',
    amountSpent: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const processQRCode = async (qrString: string) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    try {
      const qrData = visitRecordingService.parseQRCode(qrString);
      if (!qrData) {
        setScanResult({
          success: false,
          message: 'Invalid QR code format'
        });
        return;
      }
      const result = await visitRecordingService.recordVisitFromQR(
        qrData,
        user.uid,
        parseFloat(manualEntry.amountSpent) || 0,
        manualEntry.notes
      );
      setScanResult(result);
      if (result.success) {
        // Reset manual entry form
        setManualEntry({
          customerPhone: '',
          programId: '',
          amountSpent: '',
          notes: ''
        });
        stopScanning();
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Failed to process QR code'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualVisitRecord = async () => {
    if (!user || !manualEntry.customerPhone || !manualEntry.programId) {
      alert('Please fill in customer phone and select a program');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await visitRecordingService.recordVisitByPhone(
        user.uid,
        manualEntry.customerPhone,
        manualEntry.programId,
        parseFloat(manualEntry.amountSpent) || 0,
        manualEntry.notes
      );
      setScanResult(result);
      if (result.success) {
        setManualEntry({
          customerPhone: '',
          programId: '',
          amountSpent: '',
          notes: ''
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Failed to record visit manually'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate QR code detection (in real implementation, use a QR code library)
  const simulateQRScan = () => {
    // For testing purposes - replace with actual QR detection
    const testQRData = {
      customerId: 'test_customer_id',
      programId: 'test_program_id',
      businessId: user?.uid || '',
      customerPhone: '+27829876543',
      timestamp: Date.now(),
      type: 'loyalty_visit'
    };
    processQRCode(JSON.stringify(testQRData));
  };

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h2>Record Customer Visit</h2>
        <p>Scan QR code or enter customer details manually</p>
      </div>

      {/* QR Scanner */}
      <div className="scanner-section">
        <h3>QR Code Scanner</h3>
        {!isScanning ? (
          <div className="scanner-start">
            <button onClick={startScanning} className="start-scan-btn">
              Start Camera
            </button>
            <button onClick={simulateQRScan} className="test-scan-btn">
              Test Scan (Demo)
            </button>
          </div>
        ) : (
          <div className="scanner-active">
            <video ref={videoRef} autoPlay playsInline className="scanner-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <button onClick={stopScanning} className="stop-scan-btn">
              Stop Scanner
            </button>
          </div>
        )}
      </div>

      {/* Manual Entry */}
      <div className="manual-entry-section">
        <h3>Manual Entry</h3>
        <div className="manual-form">
          <input
            type="text"
            placeholder="Customer Phone Number"
            value={manualEntry.customerPhone}
            onChange={(e) => setManualEntry(prev => ({ ...prev, customerPhone: e.target.value }))}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Program ID (from customer's loyalty card)"
            value={manualEntry.programId}
            onChange={(e) => setManualEntry(prev => ({ ...prev, programId: e.target.value }))}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Amount Spent (optional)"
            value={manualEntry.amountSpent}
            onChange={(e) => setManualEntry(prev => ({ ...prev, amountSpent: e.target.value }))}
            className="form-input"
          />
          <textarea
            placeholder="Notes (optional)"
            value={manualEntry.notes}
            onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
            className="form-textarea"
          />
          <button 
            onClick={handleManualVisitRecord}
            disabled={isProcessing || !manualEntry.customerPhone || !manualEntry.programId}
            className="record-visit-btn"
          >
            {isProcessing ? 'Recording...' : 'Record Visit'}
          </button>
        </div>
      </div>

      {/* Results */}
      {scanResult && (
        <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
          <h3>{scanResult.success ? '✅ Visit Recorded!' : '❌ Error'}</h3>
          <p>{scanResult.message}</p>
          {scanResult.success && (
            <div className="visit-details">
              <p><strong>Customer:</strong> {scanResult.customerName}</p>
              <p><strong>Program:</strong> {scanResult.programName}</p>
              {scanResult.pointsEarned && (
                <p><strong>Points Earned:</strong> {scanResult.pointsEarned}</p>
              )}
              {scanResult.newTotalVisits && (
                <p><strong>Total Visits:</strong> {scanResult.newTotalVisits}</p>
              )}
            </div>
          )}
          <button 
            onClick={() => setScanResult(null)}
            className="close-result-btn"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};