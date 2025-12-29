
import React from 'react';

interface LogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

const TrendForceLogo: React.FC<LogoProps> = ({ className, theme = 'light' }) => {
  // We use the official TrendForce logo URL to ensure it matches the user's provided PNG exactly.
  // The logo image usually contains the brand icon and the text.
  // Since the user provided a specific PNG, we use an <img> tag for perfect fidelity.
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="https://www.trendforce.com/img/logo.png" 
        alt="TrendForce Logo"
        className={`h-8 w-auto object-contain transition-all duration-300 ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default TrendForceLogo;
