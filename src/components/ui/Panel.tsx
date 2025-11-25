import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Fantasy-styled panel component.
 * Used as a container for all major UI sections.
 * Features gradient background and ornate border styling.
 */
export const Panel: React.FC<PanelProps> = ({ children, className = '' }) => (
  <div
    className={`bg-gradient-to-b from-amber-950 via-stone-900 to-neutral-950 border-4 ${className}`}
    style={{
      boxShadow:
        'inset 0 2px 8px rgba(251, 191, 36, 0.2), ' +
        '0 0 30px rgba(0,0,0,0.8), ' +
        '0 4px 20px rgba(120, 53, 15, 0.5)',
      borderImage: 'linear-gradient(180deg, #92400e, #451a03) 1',
      borderStyle: 'ridge',
    }}
  >
    {children}
  </div>
);
