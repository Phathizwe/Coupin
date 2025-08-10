import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../constants/brandConstants';

interface LogoProps {
  variant?: 'default' | 'white' | 'small';
  withTagline?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  withTagline = false,
  className = '' 
}) => {
  const getLogoClasses = () => {
    switch (variant) {
      case 'white':
        return 'filter brightness-0 invert';
      case 'small':
        return 'h-8';
      default:
        return 'h-10';
    }
  };

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <Link to="/" className="flex items-center">
        <img 
          src="/logo.png" 
          alt={BRAND.name} 
          className={`${getLogoClasses()}`}
        />
      </Link>
      {withTagline && (
        <div className={`text-xs mt-1 ${variant === 'white' ? 'text-white' : 'text-secondary-500'}`}>
          {BRAND.tagline}
        </div>
      )}
    </div>
  );
};

export default Logo;