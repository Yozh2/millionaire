import React from 'react';
import { useTheme } from '../../engine/context';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Fantasy-styled panel component.
 * Used as a container for all major UI sections.
 * Features gradient background and ornate border styling.
 * Colors adapt to the current theme.
 */
export const Panel: React.FC<PanelProps> = ({ children, className = '' }) => {
  const theme = useTheme();

  return (
    <div
      className={`bg-gradient-to-b border-4 transition-all duration-300 ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${theme.bgPanelFrom}, ${theme.bgPanelVia}, ${theme.bgPanelTo})`,
        boxShadow:
          `inset 0 2px 8px ${theme.glow}, ` +
          '0 0 30px rgba(0,0,0,0.8), ' +
          `0 4px 20px ${theme.glow}`,
        borderImage: `linear-gradient(180deg, ${theme.borderImageColors}) 1`,
        borderStyle: 'ridge',
      }}
    >
      {children}
    </div>
  );
};
