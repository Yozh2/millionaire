import React from 'react';
import { useTheme } from '../../theme';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  /** Visual variant: default panel or headless (no header) */
  variant?: 'default' | 'headless';
}

/**
 * Fantasy-styled panel component.
 * Used as a container for all major UI sections.
 * Features gradient background and ornate border styling.
 * Colors adapt to the current theme.
 * Can be used with or without a PanelHeader; use variant="headless" for headerless windows.
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const theme = useTheme();

  const variantClass = variant === 'headless' ? 'rounded-md' : '';

  return (
    <div
      className={`bg-gradient-to-b border-4 transition-all duration-300 ${variantClass} ${className}`}
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
