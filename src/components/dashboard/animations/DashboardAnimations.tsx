import React, { useEffect } from 'react';

// Animation constants for emotional design
export const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-300 ease-in-out',
    medium: 'transition-all duration-500 ease-in-out',
    slow: 'transition-all duration-700 ease-in-out',
  },
  hover: {
    scale: 'hover:scale-105',
    glow: 'hover:shadow-lg hover:shadow-primary-200',
    pulse: 'hover:animate-pulse',
  },
  celebrate: {
    confetti: 'animate-confetti',
    bounce: 'animate-bounce',
    tada: 'animate-tada',
  }
};

// Mascot states for emotional connection
export const MascotStates = {
  celebrating: '🎉',
  encouraging: '👍',
  grateful: '🙏',
  welcoming: '👋',
};

// Define CSS for animations
const confettiStyles = `
  .confetti-container {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1000;
    pointer-events: none;
  }
  
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    opacity: 0.7;
    animation: fall 3s linear forwards;
  }
  
  @keyframes fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes tada {
    0% { transform: scale(1); }
    10%, 20% { transform: scale(0.9) rotate(-3deg); }
    30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
    40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
    100% { transform: scale(1) rotate(0); }
  }
  
  .animate-tada {
    animation: tada 1s ease-in-out;
  }
`;

// Hook to inject animation styles
export const useAnimationStyles = () => {
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = confettiStyles;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
};

interface CelebrationOverlayProps {
  show: boolean;
  colors: string[];
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ show, colors }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="confetti-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)]
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface AchievementNotificationProps {
  show: boolean;
  title: string;
  message: string;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ show, title, message }) => {
  if (!show) return null;
  
  return (
    <div className={`fixed bottom-8 right-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg shadow-xl z-40 ${ANIMATIONS.transition.medium} ${ANIMATIONS.celebrate.bounce}`}>
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🏆</div>
        <div>
          <h4 className="font-bold">{title}</h4>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

interface MascotProps {
  state: keyof typeof MascotStates;
  interactionCount: number;
}

export const Mascot: React.FC<MascotProps> = ({ state, interactionCount }) => {
  return (
    <div className={`fixed bottom-4 right-4 z-30 ${ANIMATIONS.transition.medium} ${interactionCount > 0 ? ANIMATIONS.celebrate.tada : ''}`}>
      <div className="bg-white rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300">
        <div className="text-3xl" title={`TYCA ${state}`}>
          {MascotStates[state]}
        </div>
      </div>
    </div>
  );
};