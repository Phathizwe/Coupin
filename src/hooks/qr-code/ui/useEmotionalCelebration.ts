import { useCallback, useState } from 'react';

interface Celebration {
  id: string;
  message: string;
  type: 'generation' | 'milestone' | 'share';
  timestamp: number;
}

/**
 * Hook for managing celebration effects in the QR code generator
 * These are purely UI enhancements and don't affect core functionality
 */
export const useEmotionalCelebration = () => {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [lastMilestones, setLastMilestones] = useState<Record<string, number>>({});

  /**
   * Create a celebration effect
   * @param message The message to display
   * @param type The type of celebration
   */
  const celebrateGeneration = useCallback((message: string) => {
    const newCelebration: Celebration = {
      id: `celebration-${Date.now()}`,
      message,
      type: 'generation',
      timestamp: Date.now()
    };

    setCelebrations(prev => [...prev, newCelebration]);

    // Optional: Trigger confetti effect if available
    if (typeof window !== 'undefined' && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Clean up celebration after a delay
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== newCelebration.id));
    }, 5000);
  }, []);

  /**
   * Celebrate when milestones are reached
   * @param scans Number of total scans
   * @param customers Number of unique customers
   */
  const celebrateMilestones = useCallback((scans: number, customers: number) => {
    const milestones: Record<string, { threshold: number, message: string }> = {
      'scans-50': { threshold: 50, message: '🎯 50 scans milestone reached!' },
      'scans-100': { threshold: 100, message: '🎉 Century milestone! 100 scans!' },
      'scans-500': { threshold: 500, message: '🚀 500 scans! Your QR codes are taking off!' },
      'customers-25': { threshold: 25, message: '👥 25 unique customers milestone!' },
      'customers-50': { threshold: 50, message: '🌟 50 unique customers! Growing community!' },
      'customers-100': { threshold: 100, message: '🏆 100 unique customers! You\'re a QR champion!' }
    };

    // Check scan milestones
    Object.entries(milestones)
      .filter(([key, milestone]) => {
        if (key.startsWith('scans-')) {
          return scans >= milestone.threshold && (!lastMilestones[key] || Date.now() - lastMilestones[key] > 86400000); // Once per day
        }
        if (key.startsWith('customers-')) {
          return customers >= milestone.threshold && (!lastMilestones[key] || Date.now() - lastMilestones[key] > 86400000); // Once per day
        }
        return false;
      })
      .forEach(([key, milestone]) => {
        const newCelebration: Celebration = {
          id: `milestone-${key}-${Date.now()}`,
          message: milestone.message,
          type: 'milestone',
          timestamp: Date.now()
        };

        setCelebrations(prev => [...prev, newCelebration]);
        setLastMilestones(prev => ({ ...prev, [key]: Date.now() }));

        // Clean up celebration after a delay
        setTimeout(() => {
          setCelebrations(prev => prev.filter(c => c.id !== newCelebration.id));
        }, 5000);
      });
  }, [lastMilestones]);

  /**
   * Celebrate when a QR code is shared
   */
  const celebrateShare = useCallback(() => {
    const newCelebration: Celebration = {
      id: `share-${Date.now()}`,
      message: '🚀 Sharing the magic! Your QR code is on its way!',
      type: 'share',
      timestamp: Date.now()
    };

    setCelebrations(prev => [...prev, newCelebration]);

    // Clean up celebration after a delay
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== newCelebration.id));
    }, 5000);
  }, []);

  return {
    celebrations,
    celebrateGeneration,
    celebrateMilestones,
    celebrateShare
  };
};

export default useEmotionalCelebration;