import React from 'react';
import { useTheme } from '../../theme';

interface PanelHeaderProps {
  children: React.ReactNode;
  /** Alignment: 'center' (default), 'between' for space-between */
  align?: 'center' | 'between';
}

/**
 * Header component for Panel.
 * Styled like an ancient scroll or document header.
 * Colors adapt to the current theme.
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  children,
  align = 'center',
}) => {
  const theme = useTheme();
  const isLightTheme = !!theme.isLight;
  const headerTextClass = theme.textHeader ?? theme.textSecondary;
  const textShadow =
    theme.panelHeaderTextShadow ??
    (isLightTheme
      ? '0 1px 2px rgba(15, 23, 42, 0.28)'
      : '0 1px 3px rgba(0,0,0,0.8)');

  const alignmentClass =
    align === 'between'
      ? 'flex justify-between items-center'
      : 'text-center';

  return (
    <div
      className={`bg-gradient-to-r ${theme.bgHeader} px-3 py-2 border-b-4 transition-all duration-300 ${alignmentClass} ${headerTextClass} text-sm tracking-wide`}
      style={{
        boxShadow: `0 2px 10px ${theme.glow}`,
        textShadow,
        borderStyle: 'solid',
        borderBottomColor: theme.headerBorderColor,
      }}
    >
      {children}
    </div>
  );
};
