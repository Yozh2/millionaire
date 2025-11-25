import React from 'react';

interface PanelHeaderProps {
  children: React.ReactNode;
}

/**
 * Header component for Panel.
 * Styled like an ancient scroll or document header.
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({ children }) => (
  <div
    className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-3 py-2 border-b-4 border-amber-950"
    style={{
      boxShadow: '0 2px 10px rgba(217, 119, 6, 0.3)',
      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      borderStyle: 'solid',
    }}
  >
    <span className="text-amber-200 text-sm tracking-wide font-serif">
      {children}
    </span>
  </div>
);
