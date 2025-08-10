import React from 'react';

interface WelcomeBannerProps {
  welcomeMessage: string;
  subMessage: string;
  mascotEmoji: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  welcomeMessage, 
  subMessage, 
  mascotEmoji 
}) => {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-primary-800 mb-1">{welcomeMessage}</h1>
      <p className="text-primary-600 text-sm">{subMessage}</p>

      <div className="mt-4 flex justify-end items-center">
        <div className="text-3xl">{mascotEmoji}</div>
      </div>
    </div>
  );
};

export default WelcomeBanner;