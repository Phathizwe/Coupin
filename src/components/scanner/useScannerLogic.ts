import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

interface UseScannerLogicProps {
  scanning: boolean;
  onCodeScanned: (code: string) => void;
}

export const useScannerLogic = ({ scanning, onCodeScanned }: UseScannerLogicProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const successfulScansRef = useRef<Map<string, number>>(new Map());
  const playAttemptedRef = useRef<boolean>(false);
  
  // Minimum time between detection attempts (in ms) - reduced for better responsiveness
  const DETECTION_THROTTLE = 200;
  // Minimum confidence threshold (number of identical scans) - reduced for easier detection
  const CONFIDENCE_THRESHOLD = 3;
  // Minimum time to collect scans before deciding (ms) - reduced for faster response
  const SCAN_COLLECTION_TIME = 1000;
  // Time when scanning started
  const scanStartTimeRef = useRef<number>(0);

  // Separate effect for video element initialization
  useEffect(() => {
    const initVideo = async () => {
      // Clean up any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Reset play attempt flag
      playAttemptedRef.current = false;
      
      if (!scanning) return;
      
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          
          // Store the stream reference
          streamRef.current = stream;
          
          if (videoRef.current && scanning) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
      }
    };

    initVideo();
    
    return () => {
      // Clean up the stream when the component unmounts or scanning stops
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [scanning]);

  // Separate effect for video playback
  useEffect(() => {
    const playVideo = async () => {
      if (!videoRef.current || !scanning || playAttemptedRef.current) return;
      
      // Only try to play once the metadata is loaded
      if (videoRef.current.readyState >= 1) {
        playAttemptedRef.current = true;
        try {
          await videoRef.current.play();
          console.log("Video playback started successfully");
        } catch (err) {
          console.error("Error playing video:", err);
        }
      }
    };
    
    // Set up event listener for metadata loaded
    const videoElement = videoRef.current;
    if (videoElement && scanning) {
      const handleMetadataLoaded = () => {
        playVideo();
      };
      
      videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
      
      // Also try to play in case the metadata is already loaded
      playVideo();
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
      };
    }
  }, [scanning]);

  // Separate effect for QR code scanning
  useEffect(() => {
    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) return;
      
      const now = Date.now();
      
      // Initialize scan start time if not set
      if (scanStartTimeRef.current === 0) {
        scanStartTimeRef.current = now;
      }
      
      // Throttle detection attempts
      if (now - lastDetectionRef.current < DETECTION_THROTTLE) {
        scannerRef.current = requestAnimationFrame(scanQRCode);
        return;
      }
      
      lastDetectionRef.current = now;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA && !video.paused && !video.ended) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth", // Try both normal and inverted colors
          });
          
          if (code && code.data) {
            // Track this code in our map of successful scans
            const currentCount = successfulScansRef.current.get(code.data) || 0;
            successfulScansRef.current.set(code.data, currentCount + 1);
            
            // Log progress for debugging
            if (currentCount % 3 === 0) { // Log every 3rd scan to reduce console spam
              console.log(`QR Code detected: ${code.data} (${currentCount + 1} times)`);
            }
            
            // Check if we have a clear winner
            if (currentCount + 1 >= CONFIDENCE_THRESHOLD) {
              console.log(`Accepting QR code with ${currentCount + 1} confirmations: ${code.data}`);
              onCodeScanned(code.data);
              return; // Stop scanning
            }
          }
          
          // If we've been scanning for a while but don't have a clear result,
          // reset and try again
          const scanningTime = now - scanStartTimeRef.current;
          if (scanningTime > SCAN_COLLECTION_TIME * 3) {
            console.log("Resetting scan collection due to timeout");
            successfulScansRef.current.clear();
            scanStartTimeRef.current = now;
          }
        } catch (err) {
          console.error('Error processing QR code:', err);
        }
      }
      
      if (scanning) {
        scannerRef.current = requestAnimationFrame(scanQRCode);
      }
    };

    if (scanning) {
      // Reset scan tracking when starting to scan
      successfulScansRef.current.clear();
      scanStartTimeRef.current = 0;
      lastDetectionRef.current = 0;
      
      // Start scanning
      scannerRef.current = requestAnimationFrame(scanQRCode);
    }
    
    return () => {
      if (scannerRef.current) {
        cancelAnimationFrame(scannerRef.current);
        scannerRef.current = null;
      }
    };
  }, [scanning, onCodeScanned]);

  const cancelScanning = () => {
    if (scannerRef.current) {
      cancelAnimationFrame(scannerRef.current);
      scannerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  return {
    videoRef,
    canvasRef,
    error,
    cancelScanning
  };
};