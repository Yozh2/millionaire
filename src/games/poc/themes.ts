/**
 * PoC Game Themes
 *
 * Minimal themes for testing the engine.
 */

import { ThemeColors } from '../../engine/types';

/**
 * Ice theme for "Easy" campaign - cool blues and cyans
 */
export const easyTheme: ThemeColors = {
  primary: 'cyan',
  textPrimary: 'text-cyan-100',
  textSecondary: 'text-cyan-200',
  textMuted: 'text-cyan-400',
  textAccent: 'text-cyan-50',
  border: 'border-cyan-500',
  borderLight: 'border-cyan-300',
  borderHover: 'hover:border-cyan-300',
  bgPanel: 'from-slate-950/95 via-cyan-950/90 to-slate-950/95',
  bgPanelFrom: '#0f172a',
  bgPanelVia: '#083344',
  bgPanelTo: '#0f172a',
  bgHeader: 'from-cyan-600 via-sky-500 to-cyan-600',
  bgHeaderVia: '#0ea5e9',
  bgButton: 'from-cyan-600 via-sky-600 to-cyan-700',
  bgButtonHover:
    'hover:from-cyan-500 hover:via-sky-500 hover:to-cyan-600',
  bgAnswer: 'from-slate-900 via-cyan-950 to-slate-950',
  bgAnswerHover: 'hover:from-cyan-900 hover:to-sky-950',
  bgLifeline: 'from-sky-600 to-cyan-700',
  bgPrizeCurrent: 'bg-cyan-600/60',
  bgPrizePassed: 'bg-slate-700/40',
  textLifeline: 'text-cyan-100',
  borderLifeline: 'border-sky-400',
  shadowAnswer: 'hover:shadow-cyan-500/50',
  glow: 'rgba(34, 211, 238, 0.6)',
  glowColor: '#22d3ee',
  glowSecondary: '#06b6d4',
  borderImageColors: '#06b6d4, #0f172a',
  headerBorderColor: '#0891b2',
};

/**
 * Fire theme for "Hard" campaign - warm reds and oranges
 */
export const hardTheme: ThemeColors = {
  primary: 'red',
  textPrimary: 'text-red-100',
  textSecondary: 'text-orange-200',
  textMuted: 'text-red-400',
  textAccent: 'text-orange-50',
  border: 'border-red-500',
  borderLight: 'border-orange-400',
  borderHover: 'hover:border-orange-400',
  bgPanel: 'from-stone-950/95 via-red-950/90 to-stone-950/95',
  bgPanelFrom: '#1c1917',
  bgPanelVia: '#450a0a',
  bgPanelTo: '#1c1917',
  bgHeader: 'from-red-600 via-orange-500 to-red-600',
  bgHeaderVia: '#f97316',
  bgButton: 'from-red-600 via-orange-600 to-red-700',
  bgButtonHover:
    'hover:from-red-500 hover:via-orange-500 hover:to-red-600',
  bgAnswer: 'from-stone-900 via-red-950 to-stone-950',
  bgAnswerHover: 'hover:from-red-900 hover:to-orange-950',
  bgLifeline: 'from-orange-600 to-red-700',
  bgPrizeCurrent: 'bg-red-600/60',
  bgPrizePassed: 'bg-stone-700/40',
  textLifeline: 'text-orange-100',
  borderLifeline: 'border-orange-400',
  shadowAnswer: 'hover:shadow-red-500/50',
  glow: 'rgba(239, 68, 68, 0.6)',
  glowColor: '#ef4444',
  glowSecondary: '#f97316',
  borderImageColors: '#ef4444, #1c1917',
  headerBorderColor: '#dc2626',
};
