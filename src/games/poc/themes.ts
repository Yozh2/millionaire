/**
 * PoC Game Themes
 *
 * Minimal themes for testing the engine.
 */

import { ThemeColors } from '../../engine/types';

/**
 * Default indigo theme for "Easy" campaign
 */
export const easyTheme: ThemeColors = {
  primary: 'indigo',
  textPrimary: 'text-indigo-200',
  textSecondary: 'text-indigo-300',
  textMuted: 'text-indigo-500',
  textAccent: 'text-indigo-100',
  border: 'border-indigo-600',
  borderLight: 'border-indigo-400',
  borderHover: 'hover:border-indigo-400',
  bgPanel: 'from-indigo-950/95 via-violet-900/90 to-indigo-950/95',
  bgPanelFrom: '#1e1b4b',
  bgPanelVia: '#4c1d95',
  bgPanelTo: '#1e1b4b',
  bgHeader: 'from-indigo-700 via-violet-600 to-indigo-700',
  bgHeaderVia: '#7c3aed',
  bgButton: 'from-indigo-600 via-violet-700 to-indigo-800',
  bgButtonHover:
    'hover:from-indigo-500 hover:via-violet-600 hover:to-indigo-700',
  bgAnswer: 'from-indigo-900 via-violet-950 to-indigo-950',
  bgAnswerHover: 'hover:from-indigo-800 hover:to-violet-900',
  bgLifeline: 'from-violet-600 to-indigo-800',
  bgPrizeCurrent: 'bg-violet-700/60',
  bgPrizePassed: 'bg-indigo-800/40',
  textLifeline: 'text-indigo-100',
  borderLifeline: 'border-violet-400',
  shadowAnswer: 'hover:shadow-violet-600/50',
  glow: 'rgba(139, 92, 246, 0.6)',
  glowColor: '#8b5cf6',
  glowSecondary: '#6366f1',
  borderImageColors: '#6366f1, #1e1b4b',
  headerBorderColor: '#4c1d95',
};

/**
 * Amber/orange theme for "Hard" campaign
 */
export const hardTheme: ThemeColors = {
  primary: 'amber',
  textPrimary: 'text-amber-200',
  textSecondary: 'text-amber-300',
  textMuted: 'text-amber-500',
  textAccent: 'text-amber-100',
  border: 'border-amber-600',
  borderLight: 'border-amber-400',
  borderHover: 'hover:border-amber-400',
  bgPanel: 'from-amber-950/95 via-orange-900/90 to-amber-950/95',
  bgPanelFrom: '#451a03',
  bgPanelVia: '#9a3412',
  bgPanelTo: '#451a03',
  bgHeader: 'from-amber-700 via-orange-600 to-amber-700',
  bgHeaderVia: '#ea580c',
  bgButton: 'from-amber-600 via-orange-700 to-amber-800',
  bgButtonHover:
    'hover:from-amber-500 hover:via-orange-600 hover:to-amber-700',
  bgAnswer: 'from-amber-900 via-orange-950 to-amber-950',
  bgAnswerHover: 'hover:from-amber-800 hover:to-orange-900',
  bgLifeline: 'from-orange-600 to-amber-800',
  bgPrizeCurrent: 'bg-orange-700/60',
  bgPrizePassed: 'bg-amber-800/40',
  textLifeline: 'text-amber-100',
  borderLifeline: 'border-orange-400',
  shadowAnswer: 'hover:shadow-orange-600/50',
  glow: 'rgba(251, 191, 36, 0.6)',
  glowColor: '#fbbf24',
  glowSecondary: '#f59e0b',
  borderImageColors: '#f59e0b, #451a03',
  headerBorderColor: '#9a3412',
};
