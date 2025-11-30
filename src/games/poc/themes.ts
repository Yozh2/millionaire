/**
 * PoC Game Themes
 *
 * Classic "Who Wants to Be a Millionaire" style themes.
 */

import { ThemeColors } from '../../engine/types';

/**
 * Classic Millionaire theme for "Easy" campaign
 * Deep blue with purple accents - the iconic WWTBAM look
 */
export const easyTheme: ThemeColors = {
  primary: 'blue',
  textPrimary: 'text-blue-100',
  textSecondary: 'text-blue-200',
  textMuted: 'text-blue-400',
  textAccent: 'text-amber-300',
  border: 'border-blue-500',
  borderLight: 'border-blue-400',
  borderHover: 'hover:border-amber-400',
  bgPanel: 'from-blue-950/95 via-indigo-950/95 to-blue-950/95',
  bgPanelFrom: '#0a1628',
  bgPanelVia: '#1e1b4b',
  bgPanelTo: '#0a1628',
  bgHeader: 'from-blue-800 via-indigo-700 to-blue-800',
  bgHeaderVia: '#4338ca',
  bgButton: 'from-blue-700 via-indigo-600 to-blue-700',
  bgButtonHover:
    'hover:from-blue-600 hover:via-indigo-500 hover:to-blue-600',
  bgAnswer: 'from-blue-950 via-indigo-950 to-blue-950',
  bgAnswerHover: 'hover:from-blue-900 hover:to-indigo-900',
  bgLifeline: 'from-indigo-600 to-blue-700',
  bgPrizeCurrent: 'bg-amber-600/70',
  bgPrizePassed: 'bg-blue-800/50',
  textLifeline: 'text-blue-100',
  borderLifeline: 'border-indigo-400',
  shadowAnswer: 'hover:shadow-indigo-500/50',
  glow: 'rgba(99, 102, 241, 0.6)',
  glowColor: '#6366f1',
  glowSecondary: '#3b82f6',
  borderImageColors: '#6366f1, #0a1628',
  headerBorderColor: '#4338ca',
};

/**
 * Gold Millionaire theme for "Hard" campaign
 * Deep blue with gold/amber accents for higher stakes feel
 */
export const hardTheme: ThemeColors = {
  primary: 'amber',
  textPrimary: 'text-amber-100',
  textSecondary: 'text-amber-200',
  textMuted: 'text-amber-400',
  textAccent: 'text-amber-300',
  border: 'border-amber-500',
  borderLight: 'border-amber-400',
  borderHover: 'hover:border-amber-300',
  bgPanel: 'from-slate-950/95 via-amber-950/90 to-slate-950/95',
  bgPanelFrom: '#0f0f0f',
  bgPanelVia: '#451a03',
  bgPanelTo: '#0f0f0f',
  bgHeader: 'from-amber-700 via-yellow-600 to-amber-700',
  bgHeaderVia: '#ca8a04',
  bgButton: 'from-amber-700 via-yellow-600 to-amber-700',
  bgButtonHover:
    'hover:from-amber-600 hover:via-yellow-500 hover:to-amber-600',
  bgAnswer: 'from-slate-950 via-amber-950 to-slate-950',
  bgAnswerHover: 'hover:from-amber-950 hover:to-yellow-950',
  bgLifeline: 'from-yellow-600 to-amber-700',
  bgPrizeCurrent: 'bg-amber-500/70',
  bgPrizePassed: 'bg-slate-700/50',
  textLifeline: 'text-amber-100',
  borderLifeline: 'border-yellow-400',
  shadowAnswer: 'hover:shadow-amber-500/50',
  glow: 'rgba(245, 158, 11, 0.6)',
  glowColor: '#f59e0b',
  glowSecondary: '#eab308',
  borderImageColors: '#f59e0b, #0f0f0f',
  headerBorderColor: '#ca8a04',
};
