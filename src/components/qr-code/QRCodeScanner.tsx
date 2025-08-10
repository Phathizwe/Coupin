import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { recordProgramVisit } from '../../services/customerProgramService';
import { getCustomerProgramEnrollment } from '../../services/customerProgramService';
import { getCustomer } from '../../services/customerService';

interface QRScannerProps {
  businessId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRScannerProps> = ({ businessId, onSuccess, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let animationFrameId: number;
    let videoStream: MediaStream | null = null;

    const startScanner = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment'
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        setScanning(true);
        scanQRCode();
      } catch (error) {
        console.error('Error accessing camera:', error);
        setErrorMessage('Could not access camera. Please check permissions.');
        onError('Could not access camera. Please check permissions.');
      }
    };

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Only process when video is playing
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR code processing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code) {
          console.log('QR Code detected:', code.data);
          
          try {
            // Parse the QR code data
            const qrData = JSON.parse(code.data);
            
            // Validate the QR code data
            if (qrData.businessId && qrData.customerId && qrData.programId) {
              // Verify this QR code is for this business
              if (qrData.businessId !== businessId) {
                setErrorMessage('This QR code is for a different business.');
                onError('This QR code is for a different business.');
                return;
              }
              
              // Process the loyalty visit
              processLoyaltyVisit(qrData);
              
              // Stop scanning
              setScanning(false);
              setScanResult(qrData);
            } else {
              setErrorMessage('Invalid QR code format.');
              onError('Invalid QR code format.');
            }
          } catch (error) {
            console.error('Error processing QR code:', error);
            setErrorMessage('Invalid QR code data.');
            onError('Invalid QR code data.');
          }
        }
      }

      // Continue scanning if still in scanning state
      if (scanning) {
        animationFrameId = requestAnimationFrame(scanQRCode);
      }
    };

    const processLoyaltyVisit = async (qrData: any) => {
      try {
        // Get the customer program enrollment
        const enrollment = await getCustomerProgramEnrollment(qrData.customerId, qrData.programId);
        
        if (!enrollment) {
          setErrorMessage('Customer is not enrolled in this program.');
          onError('Customer is not enrolled in this program.');
          return;
        }
        
        // Get customer details
        const customer = await getCustomer(qrData.customerId);
        
        // Record the visit
        await recordProgramVisit(enrollment.id);
        
        // Return success with customer and program info
        onSuccess({
          customer,
          program: enrollment,
          scannedAt: new Date()
        });
      } catch (error) {
        console.error('Error processing loyalty visit:', error);
        setErrorMessage('Error processing loyalty visit.');
        onError('Error processing loyalty visit.');
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      setScanning(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [businessId, onSuccess, onError]);

  return (
    <div className="qr-scanner-container">
      <div className="relative">
        <video 
          ref={videoRef} 
          className="qr-video-element w-full rounded-lg"
          muted
          playsInline
        />
        
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 invisible"
        />
        
        {scanning && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <div className="text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                  Position QR code in this area
                </div>
              </div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white p-2 text-center text-sm">
            {errorMessage}
          </div>
        )}
        
        {scanResult && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="text-green-600 font-bold text-lg mb-2">
                QR Code Scanned Successfully!
              </div>
              <div className="text-gray-700">
                Processing loyalty visit...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;