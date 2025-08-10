import { useState, useCallback } from 'react';

interface ProgressState {
  isActive: boolean;
  percentage: number;
  stage: 'preparing' | 'generating' | 'processing' | 'finalizing' | 'complete';
  message: string;
}

/**
 * Hook for providing visual progress feedback during QR code operations
 * These are purely UI enhancements and don't affect core functionality
 */
export const useProgressFeedback = () => {
  const [progress, setProgress] = useState<ProgressState>({
    isActive: false,
    percentage: 0,
    stage: 'preparing',
    message: 'Preparing your QR code...'
  });

  /**
   * Start the progress feedback with a simulated flow
   * @param onComplete Callback to run when progress completes
   */
  const startProgress = useCallback((onComplete?: () => void) => {
    // Reset progress state
    setProgress({
      isActive: true,
      percentage: 0,
      stage: 'preparing',
      message: 'Preparing your QR code...'
    });

    // Simulate progress stages with appropriate timing
    // This doesn't affect the actual QR code generation, just visual feedback
    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        percentage: 25,
        stage: 'generating',
        message: 'Generating your unique QR pattern...'
      }));
    }, 300);

    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        percentage: 60,
        stage: 'processing',
        message: 'Processing your coupon data...'
      }));
    }, 600);

    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        percentage: 85,
        stage: 'finalizing',
        message: 'Finalizing your magical QR code...'
      }));
    }, 900);

    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        percentage: 100,
        stage: 'complete',
        message: 'Your QR code is ready! ✨'
      }));

      // Call the completion callback
      if (onComplete) onComplete();

      // Reset after showing completion
      setTimeout(() => {
        setProgress(prev => ({
          ...prev,
          isActive: false
        }));
      }, 1000);
    }, 1200);
  }, []);

  /**
   * Update progress manually if needed
   * @param percentage Progress percentage (0-100)
   * @param message Optional message to display
   */
  const updateProgress = useCallback((percentage: number, message?: string) => {
    setProgress(prev => ({
      ...prev,
      percentage,
      message: message || prev.message
    }));
  }, []);

  /**
   * Reset the progress state
   */
  const resetProgress = useCallback(() => {
    setProgress({
      isActive: false,
      percentage: 0,
      stage: 'preparing',
      message: 'Preparing your QR code...'
    });
  }, []);

  return {
    progress,
    startProgress,
    updateProgress,
    resetProgress
  };
};

export default useProgressFeedback;