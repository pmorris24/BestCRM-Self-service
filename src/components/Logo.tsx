import React from 'react';

interface LogoProps {
  theme: 'light' | 'dark';
}

export const SisenseLogo: React.FC<LogoProps> = ({ theme }) => {
  const logoSrc =
    theme === 'dark'
      ? '/logos/sisense-logo-white.png'
      : '/logos/sisense-logo-black.png';
  return <img src={logoSrc} alt="Sisense Logo" className="logo" />;
};
