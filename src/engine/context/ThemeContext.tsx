/**
 * Theme context for the quiz engine.
 *
 * Provides theme colors to all child components.
 * Theme is derived from the selected Campaign's theme property.
 */

import React, { createContext, useContext } from 'react';
import { ThemeColors } from '../types';

/** Default slate theme for fallback */
const defaultTheme: ThemeColors = {
  primary: 'slate',
  textPrimary: 'text-slate-300',
  textSecondary: 'text-slate-400',
  textMuted: 'text-slate-600',
  textAccent: 'text-slate-200',
  border: 'border-slate-700',
  borderLight: 'border-slate-500',
  borderHover: 'hover:border-slate-500',
  bgPanel: 'from-slate-900/90 via-slate-800/95 to-slate-950/90',
  bgPanelFrom: '#1e293b',
  bgPanelVia: '#334155',
  bgPanelTo: '#0f172a',
  bgHeader: 'from-slate-700 via-slate-600 to-slate-700',
  bgHeaderVia: '#475569',
  bgButton: 'from-slate-600 via-slate-700 to-slate-800',
  bgButtonHover: 'hover:from-slate-500 hover:via-slate-600 hover:to-slate-700',
  bgAnswer: 'from-slate-800 via-slate-900 to-slate-950',
  bgAnswerHover: 'hover:from-slate-700 hover:to-slate-800',
  bgLifeline: 'from-slate-600 to-slate-800',
  bgPrizeCurrent: 'bg-slate-700/60',
  bgPrizePassed: 'bg-slate-800/40',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-slate-400',
  shadowAnswer: 'hover:shadow-slate-700/50',
  glow: 'rgba(148, 163, 184, 0.5)',
  glowColor: '#94a3b8',
  glowSecondary: '#64748b',
  borderImageColors: '#475569, #1e293b',
  headerBorderColor: '#1e293b',
};

/** Theme context */
const ThemeContext = createContext<ThemeColors>(defaultTheme);

/** Hook to access current theme colors */
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  /** Theme colors to provide to children */
  theme: ThemeColors;
  children: React.ReactNode;
}

/**
 * Theme provider component.
 * Wraps children with theme context.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  children,
}) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export { defaultTheme };
