import React from 'react';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

/**
 * SimpleLayout provides a consistent container for simple mode pages
 * to ensure they look the same on desktop as they do on mobile
 */
const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default SimpleLayout;