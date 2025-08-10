import React from 'react';

interface ScannerViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const ScannerView: React.FC<ScannerViewProps> = ({ videoRef, canvasRef }) => {
  return (
    <div className="flex-1 relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* Hidden canvas for processing video frames */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      ></canvas>
      
      {/* Scanner overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-white rounded-lg relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-4 text-center text-white">
        Position the QR code in the center
      </div>
    </div>
  );
};

export default ScannerView;